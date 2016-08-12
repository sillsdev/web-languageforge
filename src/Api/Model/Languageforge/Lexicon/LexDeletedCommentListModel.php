<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MongoMapper;
use Api\Model\ProjectModel;
use MongoDB\BSON\UTCDatetime;

class LexDeletedCommentListModel extends MapperListModel
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
     *
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        new LexProjectModel($projectModel->id->asString());

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDatetime(1000*$newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => true, 'dateModified'=> array('$gte' => $startDate)), array());
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => true), array());
        }
    }
}
