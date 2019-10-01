<?php

namespace Api\Model\Shared\Dto;

use Api\Library\Shared\Website;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\SfProjectModel;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Scriptureforge\Sfchecks\TextListModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionAnswersListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use stdClass;

class ProjectInsightsDto
{

    public static function insights($website)
    {
        // while each site may theoretically have more than one type of app, only projects associated with these apps are
        // supported by the project insights page
        $appName = $website->base === Website::LANGUAGEFORGE ? LfProjectModel::LEXICON_APP : SfProjectModel::SFCHECKS_APP;

        $projectList = new ProjectListModel();
        $projectList->read();

        $insights = new stdClass();
        $insights->projectList = [];
        $insights->appName = $appName;

        foreach ($projectList->entries as $project) {
            if ($project['appName'] !== $appName) continue;

            $id = $project['id'];
            $project = $appName === LfProjectModel::LEXICON_APP ? new LexProjectModel($id) : new SfchecksProjectModel($id);

            $projectData = new stdClass();

            // basic attributes
            $projectData->projectName = $project->projectName;
            $projectData->projectCode = $project->projectCode;
            $projectData->interfaceLanguageCode = $project->interfaceLanguageCode;
            $projectData->isArchived = $project->isArchived;
            $projectData->dateModified = $project->dateModified->asDateTimeInterface()->format(\DateTime::RFC2822);
            $projectData->dateCreated = $project->dateCreated->asDateTimeInterface()->format(\DateTime::RFC2822);
            $projectData->url = "/app/{$project->appName}/$project->id/";

            // owner data
            $owner = UserCommands::readUser($project->ownerRef->asString());
            $projectData->ownerUserName = $owner['username'];
            $projectData->ownerEmail = $owner['email'];
            $projectData->ownerName = $owner['name'];
            $projectData->ownerRole = $owner['role'];

            // user data
            $projectData->userCount = count($project->users);
            $projectData->managers = 0;
            $projectData->contributors = 0;
            $projectData->techSupport = 0;
            $projectData->noRole = 0;
            // last two roles are LF-specific and will only be added to DTO for LF projects
            $commenters = 0;
            $observers = 0;
            foreach ($project->users as $user) {
                // LF projects have LF-specific roles, but SF projects do not, so LF roles are a superset of SF roles
                $role = $user->role;
                if ($role === ProjectRoles::MANAGER) $projectData->managers++;
                else if ($role === ProjectRoles::CONTRIBUTOR) $projectData->contributors++;
                else if ($role === ProjectRoles::TECH_SUPPORT) $projectData->techSupport++;
                else if ($role === ProjectRoles::NONE) $projectData->noRole++;
                else if ($role === LexRoles::OBSERVER) $observers++;
                else if ($role === LexRoles::OBSERVER_WITH_COMMENT) $commenters++;
            }

            // activity data
            $projectActivity = ActivityListDto::getActivityForProject($project);
            $projectData->activityCount = count($projectActivity);

            $users = array();
            $recentUsers = array();
            $lastActivityDate = null;
            foreach ($projectActivity as $event) {
                $userId = (string) $event['userRef']['id'];
                $users[$userId] = array_key_exists($userId, $users) ? $users[$userId] + 1 : 1;
                if (date_create($event['date']) > date_create()->modify('-180 days')) {
                    $recentUsers[$userId] = true;
                };
                $lastActivityDate = $lastActivityDate === null ? date_create($event['date']) : max(date_create($event['date']), $lastActivityDate);
            }
            $projectData->activeUsers = 0;
            foreach ($users as $actvityCount) {
                if ($actvityCount >= 2) {
                    $projectData->activeUsers++;
                }
            }
            $projectData->recentUsers = count($recentUsers);
            $projectData->lastActivityDate = $lastActivityDate->format(\DateTime::RFC2822);

            // sf-specific data
            if ($appName === SfProjectModel::SFCHECKS_APP) {
                $textList = new TextListModel($project);
                $textList->read();
                $projectData->texts = $textList->count;
                $projectData->openTexts = 0;
                $projectData->questions = 0;
                $projectData->openQuestions = 0;
                $projectData->answers = 0;
                $projectData->openAnswers = 0;
                $projectData->comments = 0;
                $projectData->openComments = 0;
                foreach ($textList->entries as $textData) {
                    $text = new TextModel($project, $textData['id']);
                    if (!$text->isArchived) $projectData->openTexts++;

                    $questionList = new QuestionAnswersListModel($project, $textData['id']);
                    $questionList->read();
                    $projectData->questions += count($questionList->entries);
                    foreach ($questionList->entries as $questionData) {
                        $question = new QuestionModel($project, $questionData['id']);
                        $questionOpen = !$text->isArchived && !$question->isArchived;
                        if ($questionOpen) $projectData->openQuestions++;
                        $projectData->answers += count($question->answers);
                        if ($questionOpen) $projectData->openAnswers += count($question->answers);
                        foreach ($question->answers as $answer) {
                            $projectData->comments += count($answer->comments);
                            if ($questionOpen) $projectData->openComments += count($answer->comments);
                        }
                    }
                }
            }
            // lf-specific data
            else if ($appName === LfProjectModel::LEXICON_APP) {
                $projectData->lastEntryModifiedDate = $project->lastEntryModifiedDate->asDateTimeInterface()->format(\DateTime::RFC2822);
                $projectData->commenters = $commenters;
                $projectData->observers = $observers;
            }

            $insights->projectList[] = $projectData;
        }

        return $insights;
    }
}
