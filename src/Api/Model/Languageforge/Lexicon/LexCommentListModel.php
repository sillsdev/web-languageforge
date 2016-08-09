<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MongoMapper;
use Api\Model\ProjectModel;
use MongoDB\BSON\UTCDatetime;

class LexCommentListModel extends MapperListModel
{
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'lexiconComments');
        }

        return $instance;
    }

    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     * @param int $limit
     * @param int $skip
     */
    public function __construct($projectModel, $newerThanTimestamp = null, $limit = 0, $skip = 0)
    {
        $this->entries = new ArrayOf(function () use ($projectModel) { return new LexCommentModel($projectModel); });
        // sort ascending by creation date
        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDatetime($newerThanTimestamp*1000);
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => false, 'dateModified'=> array('$gte' => $startDate)), array(), array('dateCreated' => 1), $limit, $skip);
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => false), array(), array('dateCreated' => 1), $limit, $skip);
        }
    }
}
