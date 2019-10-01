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
            $managers = 0;
            $contributors = 0;
            $techSupport = 0;
            $noRole = 0;
            // last two roles are LF-specific and will only be added to DTO for LF projects
            $commenters = 0;
            $observers = 0;
            foreach ($project->users as $user) {
                // LF projects have LF-specific roles, but SF projects do not, so LF roles are a superset of SF roles
                $role = $user->role;
                if ($role === ProjectRoles::MANAGER) $managers++;
                else if ($role === ProjectRoles::CONTRIBUTOR) $contributors++;
                else if ($role === ProjectRoles::TECH_SUPPORT) $techSupport++;
                else if ($role === ProjectRoles::NONE) $noRole++;
                else if ($role === LexRoles::OBSERVER) $observers++;
                else if ($role === LexRoles::OBSERVER_WITH_COMMENT) $commenters++;
            }
            $projectData->managers = $managers;
            $projectData->contributors = $contributors;
            $projectData->techSupport = $techSupport;
            $projectData->usersWithNoRole = $noRole;

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
            $activeUserCount = 0;
            foreach ($users as $actvityCount) {
                if ($actvityCount >= 2) {
                    $activeUserCount++;
                }
            }
            $projectData->activeUsers = $activeUserCount;
            $projectData->recentUsers = count($recentUsers);
            $projectData->lastActivityDate = $lastActivityDate->format(\DateTime::RFC2822);

            // sf-specific data
            if ($appName === SfProjectModel::SFCHECKS_APP) {
                $textList = new TextListModel($project);
                $textList->read();
                $projectData->texts = $textList->count;
                $openTexts = 0;
                $questions = 0;
                $openQuestions = 0;
                $answers = 0;
                $openAnswers = 0;
                $comments = 0;
                $openComments = 0;
                foreach ($textList->entries as $textData) {
                    $text = new TextModel($project, $textData['id']);
                    if (!$text->isArchived) $openTexts++;

                    $questionList = new QuestionAnswersListModel($project, $textData['id']);
                    $questionList->read();
                    $questions += count($questionList->entries);
                    foreach ($questionList->entries as $questionData) {
                        $question = new QuestionModel($project, $questionData['id']);
                        $questionOpen = !$text->isArchived && !$question->isArchived;
                        if ($questionOpen) $openQuestions++;
                        $answers += count($question->answers);
                        if ($questionOpen) $openQuestions += count($question->answers);
                        foreach ($question->answers as $answer) {
                            $comments += count($answer->comments);
                            if ($questionOpen) $openComments += count($answer->comments);
                        }
                    }
                }
                $projectData->openTexts = $openTexts;
                $projectData->questions = $questions;
                $projectData->openQuestions = $openQuestions;
                $projectData->answers = $answers;
                $projectData->openAnswers = $openAnswers;
                $projectData->comments = $comments;
                $projectData->openComments = $openComments;
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
