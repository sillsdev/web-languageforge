<?php

namespace Api\Model\Shared\Dto;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\ActivityModelMongoMapper;
use Api\Model\Shared\GlobalUnreadActivityModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectList_UserModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadActivityModel;
use MongoDB\BSON\UTCDateTime;

class ActivityListDto
{
    // Constants used in update_entry activity content
    const EDITED_FIELD = 'edited_field';
    const ADDED_FIELD = 'added_field';
    const MOVED_FIELD = 'moved_field';
    const DELETED_FIELD = 'deleted_field';

    /**
     * @param Website $site
     * @return array
     */
    public static function getActivityTypes($site)
    {
        return ActivityModel::getActivityTypesForSiteBase($site->base);
    }

    /**
     * @param ProjectModel $projectModel
     * @param array $filterParams
     * @return array - the DTO array
     * @throws \Exception
     */
    public static function getActivityForProject($projectModel, $filterParams = [])
    {
        $activityList = new ActivityListModelByProject($projectModel, $filterParams);
        $activityList->readAsModels();
        $dto = ActivityListDtoEncoder::encodeModel($activityList, $projectModel);
        self::prepareDto($dto, $projectModel);

        return (is_array($dto['entries'])) ? $dto['entries'] : [];
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param array $filterParams
     * @return array - the DTO array
     * @throws \Exception
     */
    public static function getActivityForLexEntry($projectModel, $entryId, $filterParams = [])
    {
        $activityList = new ActivityListModelByLexEntry($projectModel, $entryId, $filterParams);
        $activityList->readAsModels();
        $dto = ActivityListDtoEncoder::encodeModel($activityList, $projectModel);
        self::prepareDto($dto, $projectModel);

        return (is_array($dto['entries'])) ? $dto['entries'] : [];
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

    /**
     * @param string $site
     * @param string $userId
     * @param array $filterParams
     * @return array - the DTO array
     * @throws \Exception
     */
    public static function getActivityForUser($site, $userId, $filterParams = [])
    {
        $projectList = new ProjectList_UserModel($site);
        $projectList->readUserProjects($userId);
        $activity = [];
        $unreadItems = [];
        foreach ($projectList->entries as $project) {
            $projectModel = new ProjectModel($project['id']);
            // Sfchecks projects need special handling of the "Users can see each others' responses" option
            $activityFilter = null;
            if ($projectModel->appName === SfchecksProjectModel::SFCHECKS_APP) {
                $sfchecksProjectModel = new SfchecksProjectModel($project['id']);
                if (! $sfchecksProjectModel->shouldSeeOtherUsersResponses($userId)) {
                    $activityFilter = function ($itemId) use ($projectModel, $userId) {
                        return self::filterActivityByUserId($projectModel, $userId, $itemId);
                    };
                }
            }
            // TODO: Figure out how to handle limit and skip parameters when we're in the all-projects view: it's more complicated than just passing them on to each project's query. 2018-02 RM
            $activity = array_merge($activity, self::getActivityForProject($projectModel, $filterParams));
            $unreadItems = array_merge($unreadItems, self::getUnreadActivityForUserInProject($userId, $project['id'], $activityFilter));
        }
        $unreadItems = array_merge($unreadItems, self::getGlobalUnreadActivityForUser($userId));
        uasort($activity, ['self', 'sortActivity']);
        $dto = [
            'activity' => $activity,
            'unread' => $unreadItems
        ];

        return $dto;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $userId
     * @param array $filterParams
     * @return array - the DTO array
     * @throws \Exception
     */
    public static function getActivityForOneProject($projectModel, $userId, $filterParams = [])
    {
        // Sfchecks projects need special handling of the "Users can see each others' responses" option
        $activityFilter = null;
        if ($projectModel->appName === SfchecksProjectModel::SFCHECKS_APP) {
            $sfchecksProjectModel = new SfchecksProjectModel($projectModel->id->asString());
            if (! $sfchecksProjectModel->shouldSeeOtherUsersResponses($userId)) {
                $activityFilter = function ($itemId) use ($projectModel, $userId) {
                    return self::filterActivityByUserId($projectModel, $userId, $itemId);
                };
            }
        }
        if (isset($activityFilter)) {
            $activity = array_filter(self::getActivityForProject($projectModel, $filterParams), $activityFilter);
            $unreadItems = self::getUnreadActivityForUserInProject($userId, $projectModel->id->asString(), $activityFilter);
        } else {
            $activity = self::getActivityForProject($projectModel, $filterParams);
            $unreadItems = self::getUnreadActivityForUserInProject($userId, $projectModel->id->asString());
        }
        uasort($activity, ['self', 'sortActivity']);
        $dto = [
            'activity' => $activity,
            'unread' => $unreadItems
        ];

        return $dto;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param array $filterParams
     * @return array - the DTO array
     * @throws \Exception
     */
    public static function getActivityForOneLexEntry($projectModel, $entryId, $filterParams = [])
    {
        $activity = self::getActivityForLexEntry($projectModel, $entryId, $filterParams);
        // TODO: handle unread items for this activity log type (single-entry). Perhaps the getUnreadActivity() functions should just take a list of items? 2018-02 RM
//        $unreadItems = self::getUnreadActivityForUserInProject($userId, $projectModel->id->asString());
        $unreadItems = [];
        uasort($activity, ['self', 'sortActivity']);
        $dto = [
            'activity' => $activity,
            'unread' => $unreadItems
        ];

        return $dto;
    }

    // note: it could be argued that this is a migration method that is not necessary if we were to migrate the database of existing activity entries with no projectId cjh 2014-07
    private static function getGlobalUnreadActivityForUser($userId)
    {
        $unreadActivity = new GlobalUnreadActivityModel($userId);
        $items = $unreadActivity->unreadItems();
        $unreadActivity->markAllRead();
        $unreadActivity->write();

        return $items;
    }

    // Helper function for getActivityForUser()
    private static function filterActivityByUserId($projectModel, $userId, $itemId)
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
                $answerAuthorId = $activity->userRefRelated->id;
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
     * @param string $fieldIdPart
     * @return array
     */
    public static function splitFieldIdPart($fieldIdPart)
    {
        $nameAndOtherParts = explode('@', $fieldIdPart, 2);
        if (empty($nameAndOtherParts[1])) {
            // No @ means no position in the field ID, but is there a GUID?
            $nameAndGuid = explode('#', $nameAndOtherParts[0], 2);
            $name = $nameAndGuid[0] ?? '';
            $guid = $nameAndGuid[1] ?? '';
            $position = -1;
        } else {
            $name = $nameAndOtherParts[0];
            $positionAndGuid = explode('#', $nameAndOtherParts[1], 2);
            $position = $positionAndGuid[0] ?? -1;
            $guid = $positionAndGuid[1] ?? '';
        }
        return [$name, intval($position), $guid];
    }

    private static function sortActivity($a, $b)
    {
        return ((new \DateTime($a['date'])) < (new \DateTime($b['date']))) ? 1 : -1;
    }

    private static function prepareDto(&$dto, ProjectModel $projectModel)
    {
        foreach ($dto['entries'] as &$item) {
            $item['content'] = $item['actionContent'];
            $item['type'] = 'project';  // FIXME: Should this always be "project"? Should it sometimes be "entry"? 2018-02 RM
            unset($item['actionContent']);
            if ($projectModel->appName === LfProjectModel::LEXICON_APP) {
                if ($item['action'] === ActivityModel::UPDATE_ENTRY || $item['action'] === ActivityModel::ADD_ENTRY) {
                    $lexProjectModel = new LexProjectModel($projectModel->id->asString());
                    $item['content'] = static::prepareActivityContentForEntryDifferences($item, $lexProjectModel);
                } else if ($item['action'] === ActivityModel::ADD_LEX_COMMENT ||
                           $item['action'] === ActivityModel::UPDATE_LEX_COMMENT ||
                           $item['action'] === ActivityModel::DELETE_LEX_COMMENT ||
                           $item['action'] === ActivityModel::UPDATE_LEX_COMMENT_STATUS ||
                           $item['action'] === ActivityModel::LEX_COMMENT_INCREASE_SCORE ||
                           $item['action'] === ActivityModel::LEX_COMMENT_DECREASE_SCORE ||
                           $item['action'] === ActivityModel::ADD_LEX_REPLY ||
                           $item['action'] === ActivityModel::UPDATE_LEX_REPLY ||
                           $item['action'] === ActivityModel::DELETE_LEX_REPLY) {
                    $labelFromMongo = $item['content'][ActivityModel::LEX_COMMENT_LABEL] ?? '';
                    unset($item['content'][ActivityModel::LEX_COMMENT_LABEL]);
                    if (! empty($labelFromMongo)) {
                        $item['content'][ActivityModel::FIELD_LABEL] = static::prepareActivityContentForCommentLabel($labelFromMongo);
                    }
                }
            }
        }
    }

    private static function prepareActivityContentForCommentLabel($labelFromMongo)
    {
        $result = [];
        $parts = explode('|', $labelFromMongo);
        foreach ($parts as $part) {
            if (StringUtil::startsWith($part, 'sense@')) {
                $pos = substr($part, strlen('sense@'));
                $result['sense'] = intval($pos);
            } else if (StringUtil::startsWith($part, 'example@')) {
                $pos = substr($part, strlen('example@'));
                $result['example'] = intval($pos);
            } else {
                $result['label'] = $part;
            }
        }
        return $result;
    }

    /**
     * @param array $item
     * @param LexProjectModel $projectModel
     * @return array
     */
    private static function prepareActivityContentForEntryDifferences($item, $projectModel)
    {

// Goal:
//
//    "oldValue.senses@0#GUID.examples@0#GUID.translation.en": "Example translation",
//    "newValue.senses@0#GUID.examples@0#GUID.translation.en": "Example translation edited",
//    "fieldLabel.senses@0#GUID.examples@0#GUID.translation.en": "Translation"
//
// becomes:
//
//{
//  oldValue: "Example translation"
//  newValue: "Example translation edited"
//  changeType: "edited_field"
//  fieldName: "translation"
//  inputSystemTag: "en"
//  sense: 1
//  example: 2
//  fieldLabel: "Translation"
//}

        $entryConfig = $projectModel->config->entry;
        $result = [];
        $changesInInput = [];
        $changesForDto = [];

        foreach ($item['content'] as $key => $value) {
            $parts = explode('.', $key, 2);
            if (empty($parts[0])) {
                continue;
            }
            if (empty($parts[1])) {
                $result[$key] = $value;
                continue;
            }
            switch ($parts[0]) {
                case 'oldValue':
                case 'newValue':
                case 'added':
                case 'moved':
                case 'deleted':
                case 'fieldLabel':
                    // Collect change records keyed by field identifier (e.g., "senses@1#GUID.definition.en")
                    if (!array_key_exists($parts[1], $changesInInput)) {
                        $changesInInput[$parts[1]] = [];
                    }
                    $changeKey = $parts[0];
                    $fieldId = $parts[1];
                    $changesInInput[$fieldId][$changeKey] = $value;
                    break;
                default:
                    // Action content that *isn't* part of a change record gets passed through unchanged
                    $result[$key] = $value;
            }
        }

        // Now go through each change record and turn it into something the frontend can handle easily

        foreach ($changesInInput as $fieldId => $change) {
            $changeType = '';
            if (array_key_exists('oldValue', $change)) {
                $changeType = ActivityListDto::EDITED_FIELD;
            } else if (array_key_exists('newValue', $change)) {
                $changeType = ActivityListDto::EDITED_FIELD;
            } else if (array_key_exists('added', $change)) {
                $changeType = ActivityListDto::ADDED_FIELD;
            } else if (array_key_exists('moved', $change)) {
                $changeType = ActivityListDto::MOVED_FIELD;
            } else if (array_key_exists('deleted', $change)) {
                $changeType = ActivityListDto::DELETED_FIELD;
            }

            // Instead of hardcoding sense and example positions, we could instead return a structure like:
            // "fieldHierarchy": ["senses", "examples", "translation"]
            // "positionHierarchy": [1, 2]
            // But it's probably best to just hardcode "sense" and "example" in the label
//            $fieldNameHierarchy = [];
//            $fieldPositionHierarchy = [];
            $fieldIdParts = explode('.', $fieldId);
            $currentConfig = $entryConfig;
            $sensePosition = null;
            $examplePosition = null;

            $mostRecentName = '';
            $mostRecentPosition = 0;
            $inputSystemTag = '';
            foreach ($fieldIdParts as $part) {
                list ($name, $position) = self::splitFieldIdPart($part);
                $position = $position + 1;  // Mongo stores 0-based indices, but DTO wants 1-based
                // $guid not used in this DTO
                if (array_key_exists($name, $currentConfig->fields)) {
                    $mostRecentName = $name;
                    $mostRecentPosition = $position;
//                    $fieldNameHierarchy[] = $name;
//                    $fieldPositionHierarchy[] = $position;
                    if ($name === LexConfig::SENSES_LIST) {
                        $sensePosition = $position;
                        $currentConfig = $currentConfig->fields[$name];
                    } else if ($name === LexConfig::EXAMPLES_LIST) {
                        $examplePosition = $position;
                        $currentConfig = $currentConfig->fields[$name];
                    }
                } else {
                    $inputSystemTag = $name;  // There will only be one
                }
            }

            $changeForDto = [];
            $changeForDto['changeType'] = $changeType;
            $changeForDto['fieldName'] = $mostRecentName;
            $changeForDto['fieldLabel'] = [];
            if (array_key_exists('fieldLabel', $change)) {
                $changeForDto['fieldLabel']['label'] = $change['fieldLabel'];
            } else {
                $changeForDto['fieldLabel']['label'] = $mostRecentName;  // Better than nothing
            }
            if ($sensePosition !== null) {
                $changeForDto['fieldLabel']['sense'] = $sensePosition;
            }
            if ($examplePosition !== null) {
                $changeForDto['fieldLabel']['example'] = $examplePosition;
            }
            if (! empty($inputSystemTag)) {
                $changeForDto['inputSystemTag'] = $inputSystemTag;
            }
            switch ($changeType) {
                case ActivityListDto::EDITED_FIELD:
                    $changeForDto['oldValue'] = $change['oldValue'] ?? '';
                    $changeForDto['newValue'] = $change['newValue'] ?? '';
                    break;
                case ActivityListDto::ADDED_FIELD:
                    $changeForDto['oldValue'] = '';
                    $changeForDto['newValue'] = $change['newValue'] ?? '';
                    break;
                case ActivityListDto::DELETED_FIELD:
                    $changeForDto['oldValue'] = $change['oldValue'] ?? '';
                    $changeForDto['newValue'] = '';
                    break;
                case ActivityListDto::MOVED_FIELD:
                    $changeForDto['movedFrom'] = $mostRecentPosition;
                    $changeForDto['movedTo'] = $change['moved'];
                    break;
            }
            $changesForDto[] = $changeForDto;
        }
        $result['changes'] = $changesForDto;
        return $result;
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

    public function encodeIdReference(&$key, $model)
    {
        if ($model->asString() == '') {
            return '';
        }
        if ($key == 'userRef' || $key == 'userRefRelated') {
            $user = new UserModel();
            if ($user->readIfExists($model->asString())) {
                return [
                    'id' => $user->id->asString(),
                    'avatar_ref' => $user->avatar_ref,
                    'username' => $user->username
                ];
            } else {
                return '';
            }
        } elseif ($key == 'projectRef') {
            $project = new ProjectModel($model->asString());
            return [
                'id' => $project->id->asString(),
                'type' => $project->appName,
            ];
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
     * @throws \Exception
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
     * @param array $query
     * @param array $filterParams
     */
    public function __construct($projectModel, $query = null, array $filterParams = [])
    {
        if (!isset($query)) {
            $query = ['action' => ['$regex' => '']];
        }
        if (!isset($query)) {
            $query = ['action' => ['$regex' => '']];
        }
        if (isset($filterParams['startDate']) || isset($filterParams['endDate'])) {
            $query['dateCreated'] = [];
        }
        if (isset($filterParams['startDate'])) {
            $startDate = new UTCDateTime(strtotime($filterParams['startDate']) * 1000);  // Seriously? There's GOT to be a better way to get Mongo to parse a date string... 2018-02 RM
            $query['dateCreated']['$gte'] = $startDate;
        }
        if (isset($filterParams['endDate'])) {
            $endDate = new UTCDateTime(strtotime($filterParams['endDate']) * 1000);  // Ditto 2018-02 RM
            $query['dateCreated']['$lte'] = $endDate;
        }
        $limit = $filterParams['limit'] ?? 100;
        $skip  = $filterParams['skip'] ?? 0;
        $this->entries = new MapOf(function () use ($projectModel) { return new ActivityModel($projectModel); });
        parent::__construct(
            ActivityModelMongoMapper::connect($projectModel->databaseName()),
            $query, [], ['dateCreated' => -1], $limit, $skip
        );
    }
}

// This class is currently unused, but might produce a more elegant solution than the current getActivityForUser() implementation. 2018-02 RM
class ActivityListModelByUser extends ActivityListModel
{
    /**
     * ActivityListModel constructor.
     * @param ProjectModel $projectModel
     * @param UserModel $userModel
     * @param array $filterParams
     */
    public function __construct($projectModel, $userModel, array $filterParams = [])
    {
        $userId = $userModel->id->asString();
        parent::__construct($projectModel,
            ['action' => ['$regex' => ''],
                '$or' => ['userRef'  => MongoMapper::mongoID($userId),
                    'userRefRelated' => MongoMapper::mongoID($userId)]],
            $filterParams
        );
    }
}

class ActivityListModelByProject extends ActivityListModel
{
    /**
     * ActivityListModel constructor.
     * @param ProjectModel $projectModel
     * @param array $filterParams
     */
    public function __construct($projectModel, array $filterParams = [])
    {
        parent::__construct($projectModel,
            ['action' => ['$regex' => ''],
             'projectRef' => MongoMapper::mongoID($projectModel->id->asString())],
            $filterParams
        );
    }
}

class ActivityListModelByLexEntry extends ActivityListModel
{
    /**
     * ActivityListModel constructor.
     * @param ProjectModel $projectModel
     * @param string $entryId
     * @param array $filterParams
     */
    public function __construct($projectModel, $entryId, array $filterParams)
    {
        parent::__construct($projectModel,
            ['action' => ['$regex' => ''],
             'entryRef' => MongoMapper::mongoID($entryId)],
            $filterParams
        );
    }
}
