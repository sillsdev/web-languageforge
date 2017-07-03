<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\ActivityModelMongoMapper;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\GlobalUnreadActivityModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\ProjectList_UserModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UnreadItem;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadActivityModel;

class ActivityListDto
{
    /**
     * @param ProjectModel $projectModel
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
    public static function getGlobalUnreadActivityForUser($userId, $activityFilter = null)
    {
        $unreadActivity = new GlobalUnreadActivityModel($userId);
        $items = $unreadActivity->unreadItems();
        $unreadActivity->markAllRead();
        $unreadActivity->write();

        return $items;
    }

    public static function getUnreadActivityForUserInProject($userId, $projectId, $activityFilter = null)
    {
        $unreadActivity = new UnreadActivityModel($userId, $projectId);
        $items = $unreadActivity->unreadItems();
        if (isset($activityFilter)) {
            $items = array_filter($items, $activityFilter);
            $unreadActivity->markMultipleRead($items);
        } else {
            $unreadActivity->markAllRead();
        }
        $unreadActivity->write();

        return $items;
    }

    // Helper function for getActivityForUser()
    public static function filterActivityByUserId($projectModel, $userId, $itemId)
    {
        $activity = new ActivityModel($projectModel, $itemId);
        switch ($activity->action) {
            case ActivityModel::ADD_ANSWER:
            case ActivityModel::UPDATE_ANSWER:
                $authorId = $activity->userRef->id;
                return ($authorId == $userId);
                break;
            case ActivityModel::ADD_COMMENT:
            case ActivityModel::UPDATE_COMMENT:
                $commentAuthorId = $activity->userRef->id;
                $answerAuthorId = $activity->userRef2->id;
                return ($answerAuthorId == $userId && $commentAuthorId == $userId);
                break;
            case ActivityModel::INCREASE_SCORE:
            case ActivityModel::DECREASE_SCORE:
                // These activities actually do not preserve enough information for us to tell whose answer was voted on!
                // So we can only filter by "You yourself voted an answer up or down", and can't tell whose answer it was.
                $voterId = $activity->userRef->id;
                return ($voterId == $userId);
                break;
            default:
                return true;
        }
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
            // Sfchecks projects need special handling of the "Users can see each others' responses" option
            $activityFilter = null;
            if ($projectModel->appName === SfchecksProjectModel::SFCHECKS_APP) {
                $sfchecksProjectModel = new SfchecksProjectModel($project['id']);
                if (! $sfchecksProjectModel->usersSeeEachOthersResponses) {
                    $activityFilter = function ($itemId) use ($projectModel, $userId) {
                        return self::filterActivityByUserId($projectModel, $userId, $itemId);
                    };
                }
            }
            $activity = array_merge($activity, self::getActivityForProject($projectModel));
            $unreadItems = array_merge($unreadItems, self::getUnreadActivityForUserInProject($userId, $project['id'], $activityFilter));
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
        return ((new \DateTime($a['date'])) < (new \DateTime($b['date']))) ? 1 : -1;
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

class ActivityListDtoEncoder extends JsonEncoder
{
    /**
     * @param ProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        $this->_project = $projectModel;
    }

    private $_project;

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
     * @param ActivityListModel $model - the model to encode
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

class ActivityListModel extends MapperListModel
{
    /**
     * ActivityListModel constructor.
     * @param ProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        // hardcoded to limit 100.  TODO implement paging
        $this->entries = new MapOf(function () use ($projectModel) { return new ActivityModel($projectModel); });
        parent::__construct(
            ActivityModelMongoMapper::connect($projectModel->databaseName()),
            array('action' => array('$regex' => '')), array(), array('dateCreated' => -1), 100
        );
    }
}
