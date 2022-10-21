<?php

namespace Api\Model\Shared;

use Api\Library\Shared\Palaso\DbScriptLogger;
use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Rights\ProjectRoles;

class DbIntegrityHelper extends DbScriptLogger
{
    /**
     * @param boolean $makeChanges
     */
    public function __construct($makeChanges = false)
    {
        ini_set("xdebug.show_exception_trace", 0);
        parent::__construct($makeChanges);
        $this->projectsChecked = 0;
        $this->projectsFixed = 0;
        $this->usersChecked = 0;
        $this->usersFixed = 0;
        $this->inactiveUsers = 0;
        $this->commentsAvailable = 0;
        $this->commentsMissingContextGuid = 0;
        $this->emails = [];
        $this->usernames = [];
        $this->usersNeverValidated = [];
        $this->usersNoEmail;
        $this->usersDeleted = [];
    }

    private $projectsChecked;
    private $projectsFixed;
    private $usersChecked;
    private $usersFixed;
    private $usersDeleted;
    private $inactiveUsers;
    private $emails;
    private $usernames;
    private $usersNeverValidated;
    private $usersNoEmail;
    private $commentsAvailable;
    private $commentsMissingContextGuid;

    public function checkProject($projectId)
    {
        $project = new ProjectModel($projectId);
        $this->projectsChecked++;
        #$this->info("Checking {$project->projectName}");

        if ($project->projectName == "") {
            $this->fix("$projectId has an empty projectName. Setting to 'Unknown Project'");
            $this->projectsFixed++;
            $project->projectName = "Unknown Project Name";
        }

        if ($project->projectCode == "") {
            $this->warn("{$project->projectName} has an empty projectCode.  This will certainly cause failures");
        }

        // check that a database exists for this project
        try {
            $databaseName = $project->databaseName();
        } catch (\Exception $e) {
            $databaseName = "";
        }
        if (!MongoStore::hasDB($databaseName)) {
            $newProjectCode = str_replace(" ", "_", strtolower($project->projectName));
            $newDatabaseName = "sf_" . $newProjectCode;
            if (MongoStore::hasDB($newDatabaseName)) {
                $this->warn(
                    "projectCode does not correspond to an existing MongoDb but projectName does (db migration required)"
                );
                $this->fix("Changed projectCode to $newProjectCode");
                $this->projectsFixed++;
                $project->projectCode = $newProjectCode;
            } else {
                $this->warn(
                    "{$project->projectName} has no corresponding database. (could indicate a brand new project with no data"
                );
            }
        }

        if ($project->siteName == "") {
            $this->warn("{$project->projectName} has no corresponding website (will not appear on any site)");
        }

        if ($project->appName == "") {
            $this->warn("{$project->projectName} has no app associated with it");
        }

        // make sure project has an owner
        $defaultOwnerId = "52b2a2ac56dd85546e8c4f59";
        if ($project->ownerRef->asString() == "") {
            $this->warn("{$project->projectName} has no owner.");
            $this->fix("Setting owner for {$project->projectName} to be $defaultOwnerId");
            $project->ownerRef->id = $defaultOwnerId;
            $this->projectsFixed++;
        }

        // make sure project owner is manager role on project
        $ownerUserModel = null;
        if (!$project->userIsMember($project->ownerRef->asString())) {
            try {
                $ownerUserModel = new UserModel($project->ownerRef->asString());
            } catch (\Exception $e) {
                $this->warn("{$project->projectName} owner {$project->ownerRef->asString()} does not exist!");
                $this->fix("Setting owner for {$project->projectName} to be $defaultOwnerId");
                $project->ownerRef->id = $defaultOwnerId;
                $this->projectsFixed++;
                $ownerUserModel = new UserModel($project->ownerRef->asString());
            }
            $this->fix("Owner for {$project->projectName} now has manager role for the project.");
            $project->addUser($project->ownerRef->asString(), ProjectRoles::MANAGER);
            $ownerUserModel->addProject($projectId);
            $this->projectsFixed++;
        }

        if ($this->makeChanges) {
            $project->write();
            if (!is_null($ownerUserModel)) {
                $ownerUserModel->write();
            }
        }

        // Lexicon projects need to update comments that don't contain the contextGuid field
        if ($project->appName == "lexicon") {
            $this->checkLexiconComments($project);
        }
    }

    public function checkUser($userId)
    {
        $this->usersChecked++;
        $user = new UserModel($userId);
        $userFixed = false;

        if (empty($user->email) && empty($user->emailPending)) {
            $this->usersNoEmail[] = $user->username;
        }

        if ($user->email != UserCommands::sanitizeInput($user->email)) {
            $newEmail = UserCommands::sanitizeInput($user->email);
            $this->info("{$user->email} will be normalized to $newEmail");
            $user->email = $newEmail;
            $userFixed = true;
        }

        if (!empty($user->emailPending)) {
            if (
                count($user->projects->refs) == 0 &&
                empty($user->last_login) &&
                $user->created_on < time() - 31557600
            ) {
                // user has no projects and never validated their email and never logged in and created over a year ago
                $this->usersDeleted[] = $user->username;
                if ($this->makeChanges) {
                    $user->remove();
                }
                return;
            }
            $this->usersNeverValidated[] = $user->username;
        }

        if (empty($user->username) && $user->created_on < time() - 31557600) {
            // user record has no username and was created over a year ago (invited via email but user record never completed)
            // delete
            $this->usersDeleted[] = $user->id->asString();
            if ($this->makeChanges) {
                $user->remove();
            }
            return;
        }

        if (!$user->active) {
            $this->inactiveUsers++;
        }

        if ($userFixed) {
            $this->usersFixed++;
        }

        if (!empty($user->email)) {
            $this->emails[] = $user->email;
        }
        $this->usernames[] = UserCommands::sanitizeInput($user->username);

        if ($this->makeChanges) {
            $user->write();
        }
    }

    public function generateSummary()
    {
        $duplicateEmails = self::_getDuplicates($this->emails);
        $duplicateEmailsCount = count($duplicateEmails);
        if ($duplicateEmailsCount > 0) {
            $this->warn(
                "There were $duplicateEmailsCount duplicate user records keyed on email:\n " .
                    join(", ", $duplicateEmails)
            );
        }
        $duplicateUsernames = self::_getDuplicates($this->usernames);
        $duplicateUsernamesCount = count($duplicateUsernames);
        if ($duplicateUsernamesCount > 0) {
            $this->warn(
                "There were $duplicateUsernamesCount duplicate user records keyed on username:\n " .
                    join(", ", $duplicateUsernames)
            );
        }

        if (count($this->usersNoEmail) > 0) {
            $this->warn(
                count($this->usersNoEmail) . " users have no email address:\n" . join(", ", $this->usersNoEmail)
            );
        }

        if (count($this->usersDeleted) > 0) {
            $this->warn(count($this->usersDeleted) . " users were deleted:\n" . join(", ", $this->usersDeleted));
        }

        $this->info("\nPROJECT REPORT\n");
        $this->info("{$this->projectsChecked} projects checked");
        if ($this->projectsFixed > 0) {
            $this->info("{$this->projectsFixed} projects fixed");
        } else {
            $this->info("No projects needed to be fixed");
        }
        $this->info("\nUSER REPORT\n");
        $this->info($this->usersChecked - $this->inactiveUsers . " active users");
        $this->info("{$this->inactiveUsers} inactive users");
        if (count($this->usersNeverValidated) > 0) {
            $this->info(count($this->usersNeverValidated) . " users have never validated their email address.");
        }
        if ($this->usersFixed > 0) {
            $this->info("{$this->usersFixed} users fixed");
        }
        if (count($this->usersDeleted) > 0) {
            $this->info(count($this->usersDeleted) . " users deleted");
        }

        $this->info("\nCOMMENT REPORT\n");
        $this->info("{$this->commentsAvailable} comments checked");
        if ($this->commentsMissingContextGuid > 0) {
            $this->info("{$this->commentsMissingContextGuid} comments fixed");
        } else {
            $this->info("No comments were found with the missing contextGuid field");
        }
    }

    /**
     * @param $array array
     * @return array
     */
    public static function _getDuplicates($array)
    {
        $dups = [];
        foreach (array_count_values($array) as $val => $c) {
            if ($c > 1) {
                $dups[] = $val;
            }
        }
        return $dups;
    }

    /**
     * @param $project ProjectModel
     */
    private function checkLexiconComments($project)
    {
        $lexProject = new LexProjectModel($project->id->asString());
        $commentList = new LexCommentListModel($lexProject);
        $commentList->read();
        // Loop through all comments on the project
        foreach ($commentList->entries as $comment) {
            $this->commentsAvailable++;
            $lexComment = new LexCommentModel($project, $comment["id"]);
            $fieldName = $lexComment->regarding->field;
            $contextGuid = $fieldName;
            $useEntryIdContext = false;
            $lexEntry = new LexEntryModel($project, $lexComment->entryRef->id);
            // Only need to interact with comments that have no contextGuid
            if (empty($comment["contextGuid"])) {
                if ($fieldName) {
                    $fieldConfig = $this->getLexiconFieldConfig($lexProject, $fieldName);
                    // Construct the basics of the contextGuid
                    if (!empty($lexComment->regarding->inputSystem)) {
                        // The input system is a tricky one as there has been a bug where the language name
                        // has been recorded against this field until a fix on 569d222 changed it to be the tag.
                        // We need to identify if the inputSystem has been saved as the language name or the tag
                        foreach ($lexProject->inputSystems as $inputSystem) {
                            if (
                                $inputSystem->languageName == $lexComment->regarding->inputSystem &&
                                $inputSystem->abbreviation == $lexComment->regarding->inputSystemAbbreviation
                            ) {
                                // Update the input system so that it is also updated in the DB
                                $lexComment->regarding->inputSystem = $inputSystem->tag;
                                break;
                            }
                        }
                        // Now we can attach the input system knowing it is correct
                        $contextGuid .= "." . $lexComment->regarding->inputSystem;
                    }
                    if (isset($fieldConfig->type)) {
                        if ($fieldConfig->type === "multioptionlist") {
                            $contextGuid .= "#" . $lexComment->regarding->fieldValue;
                        } elseif ($fieldConfig->type === "pictures") {
                            $contextGuid = "pictures#" . $lexComment->regarding->fieldValue;
                        }
                    }
                    // If there is only a single sense and example then we can also safely assume a comment
                    // belonging to that as well if required
                    if ($this->isLexiconFieldSense($lexProject, $fieldName)) {
                        if (count($lexEntry->senses) == 1) {
                            $contextGuid = "sense#" . $lexEntry->senses[0]->guid . " " . $contextGuid;
                        } else {
                            // If there is more than one we can try and guess based off the current value
                            // compared to the value stored with the comment - this won't work if the value
                            // has changed since the comment was made. If we can't find a match then
                            // set the context to the entry itself so that it can be located still via the UI
                            $useEntryIdContext = true;
                            foreach ($lexEntry->senses as $sense) {
                                if (
                                    $this->checkLexiconFieldAgainstComment(
                                        $sense,
                                        $fieldName,
                                        $fieldConfig,
                                        $lexComment
                                    )
                                ) {
                                    $contextGuid = "sense#" . $sense->guid . " " . $contextGuid;
                                    $useEntryIdContext = false;
                                    break;
                                }
                            }
                        }
                    } elseif ($this->isLexiconFieldExample($lexProject, $fieldName)) {
                        // Can only assume if there is also only a single sense
                        if (count($lexEntry->senses) == 1) {
                            if (count($lexEntry->senses[0]->examples) == 1) {
                                $contextGuid =
                                    "sense#" .
                                    $lexEntry->senses[0]->guid .
                                    " example#" .
                                    $lexEntry->senses[0]->examples[0]->guid .
                                    " " .
                                    $contextGuid;
                            }
                        } else {
                            // If there is more than one we can try and guess based off the current value
                            // compared to the value stored with the comment - this won't work if the value
                            // has changed since the comment was made. If we can't find a match then
                            // set the context to the entry itself so that it can be located still via the UI
                            $useEntryIdContext = true;
                            foreach ($lexEntry->senses as $sense) {
                                foreach ($sense->examples as $example) {
                                    if (
                                        $this->checkLexiconFieldAgainstComment(
                                            $example,
                                            $fieldName,
                                            $fieldConfig,
                                            $lexComment
                                        )
                                    ) {
                                        $contextGuid =
                                            "sense#" . $sense->guid . " example#" . $example->guid . " " . $contextGuid;
                                        $useEntryIdContext = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                // Use the entry ID as context in cases where it can't be figured out
                if ($useEntryIdContext || empty($contextGuid)) {
                    $contextGuid = "entry#" . $lexEntry->guid;
                }
                // Set the new contextGuid and update the comment
                $lexComment->contextGuid = $contextGuid;
                if ($this->makeChanges) {
                    $lexComment->write();
                }
                $this->commentsMissingContextGuid++;
            }
        }
    }

    /**
     * @param $lexProject LexProjectModel
     * @param $fieldName string
     * @return mixed|null
     */
    private function getLexiconFieldConfig($lexProject, $fieldName)
    {
        $fieldConfig = null;
        if (isset($lexProject->config->entry->fields[$fieldName])) {
            $fieldConfig = $lexProject->config->entry->fields[$fieldName];
        } elseif (isset($lexProject->config->entry->fields["senses"]->fields[$fieldName])) {
            $fieldConfig = $lexProject->config->entry->fields["senses"]->fields[$fieldName];
        } elseif (isset($lexProject->config->entry->fields["senses"]->fields["examples"]->fields[$fieldName])) {
            $fieldConfig = $lexProject->config->entry->fields["senses"]->fields["examples"]->fields[$fieldName];
        }
        return $fieldConfig;
    }

    /**
     * @param $lexProject LexProjectModel
     * @param $fieldName string
     * @return bool
     */
    private function isLexiconFieldSense($lexProject, string $fieldName)
    {
        return isset($lexProject->config->entry->fields["senses"]->fields[$fieldName]);
    }

    /**
     * @param $lexProject LexProjectModel
     * @param $fieldName string
     * @return bool
     */
    private function isLexiconFieldExample($lexProject, string $fieldName)
    {
        return isset($lexProject->config->entry->fields["senses"]->fields["examples"]->fields[$fieldName]);
    }

    /**
     * @param $context object
     * @param $fieldName string
     * @param $fieldConfig object
     * @param $lexComment LexCommentModel
     * @return bool
     */
    private function checkLexiconFieldAgainstComment($context, $fieldName, $fieldConfig, $lexComment)
    {
        $contextValue = "";
        $regardingValue = $lexComment->regarding->fieldValue;
        if (isset($context->{$fieldName})) {
            if ($fieldConfig->type == "pictures") {
                foreach ($context->{$fieldName} as $picture) {
                    if (empty($lexComment->regarding->inputSystem)) {
                        // Some values, perhaps from an original bug when comments were first created with context
                        // Have a # in the value i.e. value#value
                        if (
                            $picture->guid . "#" . $picture->guid == $regardingValue ||
                            $picture->guid == $regardingValue
                        ) {
                            $contextValue = $regardingValue;
                        }
                    } else {
                        if (isset($picture->caption[$lexComment->regarding->inputSystem])) {
                            $contextValue =
                                $picture->guid . " " . $fieldConfig->type . "." . $lexComment->regarding->inputSystem;
                        }
                    }
                }
            } elseif (!empty($lexComment->regarding->inputSystem)) {
                if (isset($context->{$fieldName}[$lexComment->regarding->inputSystem])) {
                    $contextValue = $context->{$fieldName}[$lexComment->regarding->inputSystem]->value;
                }
            } elseif (isset($context->{$fieldName}->value)) {
                $contextValue = $context->{$fieldName}->value;
            } elseif (isset($context->{$fieldName}->values)) {
                foreach ($context->{$fieldName}->values as $fieldValue) {
                    // Some values, perhaps from an original bug when comments were first created with context
                    // Have a # in the value for multi list options and semantic domains i.e. value#value
                    if ($fieldValue . "#" . $fieldValue == $regardingValue || $fieldValue == $regardingValue) {
                        $contextValue = $regardingValue;
                        break;
                    }
                }
            }
        }
        if (!empty($contextValue) && $contextValue == $regardingValue) {
            return true;
        }
        return false;
    }
}

class DbIntegrityHelperResult
{
    const OK = "ok";
    const DEGRADED = "degraded";

    public $shouldDelete;

    public $state;
}
