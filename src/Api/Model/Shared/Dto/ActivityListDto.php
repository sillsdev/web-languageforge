<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\ActivityListModel;
use Api\Model\GlobalUnreadActivityModel;
use Api\Model\ProjectList_UserModel;
use Api\Model\ProjectModel;
use Api\Model\QuestionModel;
use Api\Model\TextModel;
use Api\Model\UserModel;
use Api\Model\UnreadActivityModel;

require_once APPPATH . 'Api/Model/ActivityModel.php';

class ActivityListDtoEncoder extends JsonEncoder
{
    private $_project;

    /**
     *
     * @param ProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        $this->_project = $projectModel;
    }
    public function encodeIdReference($key, $model)
    {
        if ($model->asString() == '') {
            return '';
        }
        if ($key == 'userRef' || $key == 'userRef2') {
            $user = new UserModel();
            if ($user->exists($model->asString())) {
                $user->read($model->asString());

                return array(
                    'id' => $user->id->asString(),
                    'avatar_ref' => $user->avatar_ref,
                    'username' => $user->username
                );
            } else {
                return '';
            }
        } elseif ($key == 'projectRef') {
            $project = new ProjectModel($model->asString());
            return array(
                'id' => $project->id->asString(),
                'type' => $project->appName,
            );
        } elseif ($key == 'textRef') {
            $text = new TextModel($this->_project);
            if ($text->exists($model->asString())) {
                return $model->asString();
            } else {
                return '';
            }
        } elseif ($key == 'questionRef') {
            $question = new QuestionModel($this->_project);
            if ($question->exists($model->asString())) {
                return $model->asString();
            } else {
                return '';
            }
        } elseif ($key == 'entryRef') {
            $entry = new LexEntryModel($this->_project);
            if ($entry->exists($model->asString())) {
                return $model->asString();
            } else {
                return '';
            }
        } else {
            return $model->asString();
        }
    }

    /**
     *
     * @param Object $model - the model to encode
     * @param ProjectModel $projectModel
     * @return array
     */
    public static function encodeModel($model, $projectModel)
    {
        /* Note: I had to change the name of this static method to something else besides 'encode' because
         * PHP complained about the signature not being the same as the parent class JsonEncoder
         * cjh 2013-08
         */
        $e = new ActivityListDtoEncoder($projectModel);

        return $e->_encode($model);
    }
}

class ActivityListDto
{
    /**
     * @param string $projectModel
     * @param string $questionId
     * @return array - the DTO array
     */
    public static function getActivityForProject($projectModel)
    {
        $activityList = new ActivityListModel($projectModel);
        $activityList->readAsModels();
        $dto = ActivityListDtoEncoder::encodeModel($activityList, $projectModel);
        self::prepareDto($dto);

        return (is_array($dto['entries'])) ? $dto['entries'] : array();
    }

    // note: it could be argued that this is a migration method that is not necessary if we were to migrate the database of existing activity entries with no projectId cjh 2014-07
    public static function getGlobalUnreadActivityForUser($userId)
    {
        $unreadActivity = new GlobalUnreadActivityModel($userId);
        $items = $unreadActivity->unreadItems();
        $unreadActivity->markAllRead();
        $unreadActivity->write();

        return $items;
    }

    public static function getUnreadActivityForUserInProject($userId, $projectId)
    {
        $unreadActivity = new UnreadActivityModel($userId, $projectId);
        $items = $unreadActivity->unreadItems();
        $unreadActivity->markAllRead();
        $unreadActivity->write();

        return $items;
    }

    /**
     * @param string $site
     * @param string $userId
     * @return array - the DTO array
    */
    public static function getActivityForUser($site, $userId)
    {
        $projectList = new ProjectList_UserModel($site);
        $projectList->readUserProjects($userId);
        $activity = array();
        $unreadItems = array();
        foreach ($projectList->entries as $project) {
            $projectModel = new ProjectModel($project['id']);
            $activity = array_merge($activity, self::getActivityForProject($projectModel));
            $unreadItems = array_merge($unreadItems, self::getUnreadActivityForUserInProject($userId, $project['id']));
        }
        $unreadItems = array_merge($unreadItems, self::getGlobalUnreadActivityForUser($userId));
        uasort($activity, array('self', 'sortActivity'));
        $dto = array(
                'activity' => $activity,
                'unread' => $unreadItems
        );

        return $dto;
    }

    private static function sortActivity($a, $b)
    {
        return (new \DateTime($a['date']) < new \DateTime($b['date'])) ? 1 : -1;
    }

    private static function prepareDto(&$dto)
    {
        foreach ($dto['entries'] as &$item) {
            $item['content'] = $item['actionContent'];
            $item['type'] = 'project';
            unset($item['actionContent']);
        }
    }
}
