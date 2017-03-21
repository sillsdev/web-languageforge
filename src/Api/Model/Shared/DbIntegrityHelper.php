<?php

namespace Api\Model\Shared;

use Api\Library\Shared\Palaso\DbScriptLogger;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Mapper\MongoStore;

class DbIntegrityHelper extends DbScriptLogger
{
    /**
     * @param boolean $makeChanges
     */
    public function __construct($makeChanges = false) {
        ini_set('xdebug.show_exception_trace', 0);
        parent::__construct($makeChanges);
        $this->projectsChecked = 0;
        $this->projectsFixed = 0;
        $this->usersChecked = 0;
        $this->usersFixed = 0;
        $this->inactiveUsers = 0;
        $this->emails = array();
        $this->usernames = array();
        $this->usersNeverValidated = array();
        $this->usersNoEmail;
        $this->usersDeleted = array();
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

    public function checkProject($projectId) {
        $project = new ProjectModel($projectId);
        $this->projectsChecked++;
        #$this->info("Checking {$project->projectName}");

        
        if ($project->projectName == '') {
            $this->warn("$projectId has an empty projectName");
        }
        
        if ($project->projectCode == '') {
            $this->warn("{$project->projectName} has an empty projectCode.  This will certainly cause failures");
        }
        
        // check that a database exists for this project
        try {
            $databaseName = $project->databaseName();
        } catch (\Exception $e) {
            $databaseName = "";
        }
        if (!MongoStore::hasDB($databaseName)) {
            $newProjectCode = str_replace(' ', '_', strtolower($project->projectName));
            $newDatabaseName = 'sf_' . $newProjectCode;
            if (MongoStore::hasDB($newDatabaseName)) {
                $this->warn("projectCode does not correspond to an existing MongoDb but projectName does (db migration required)");
                $this->fix("Changed projectCode to $newProjectCode");
                $this->projectsFixed++;
                $project->projectCode = $newProjectCode;
            } else {
                $this->warn("{$project->projectName} has no corresponding database. (could indicate a brand new project with no data");
            }
        }
        
        if ($project->siteName == '') {
            $this->warn("{$project->projectName} has no corresponding website (will not appear on any site)");
        }

        if ($project->appName == '') {
            $this->warn("{$project->projectName} has no app associated with it");
        }
        
        if ($this->makeChanges) {
            $project->write();
        }
    }
    
    public function checkUser($userId) {
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

            if (count($user->projects->refs) == 0 && empty($user->last_login) && $user->created_on < (time() - 31557600)) {
                // user has no projects and never validated their email and never logged in and created over a year ago
                $this->usersDeleted[] = $user->username;
                if ($this->makeChanges) {
                    $user->remove();
                }
                return;
            }
            $this->usersNeverValidated[] = $user->username;
        }

        if (empty($user->username) && $user->created_on < (time() - 31557600)) {
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
    
    public function generateSummary() {
        $duplicateEmails = self::_getDuplicates($this->emails);
        $duplicateEmailsCount = count($duplicateEmails);
        if ($duplicateEmailsCount > 0) {
            $this->warn("There were $duplicateEmailsCount duplicate user records keyed on email:\n " . join(", ", $duplicateEmails));
        }
        $duplicateUsernames = self::_getDuplicates($this->usernames);
        $duplicateUsernamesCount = count($duplicateUsernames);
        if ($duplicateUsernamesCount > 0) {
            $this->warn("There were $duplicateUsernamesCount duplicate user records keyed on username:\n " . join(", ", $duplicateUsernames));
        }

        if (count($this->usersNoEmail) > 0) {
            $this->warn(count($this->usersNoEmail) . " users have no email address:\n" . join(", ", $this->usersNoEmail));
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
        $this->info(($this->usersChecked - $this->inactiveUsers) . " active users");
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

    }

    /**
     * @param $array array
     * @return array
     */
    public static function _getDuplicates($array) {
        $dups = array();
        foreach(array_count_values($array) as $val => $c) {
            if($c > 1) $dups[] = $val;
        }
        return $dups;
    }

}

class DbIntegrityHelperResult
{
    const OK = 'ok';
    const DEGRADED = 'degraded';
    
    public $shouldDelete;
    
    public $state;
}
