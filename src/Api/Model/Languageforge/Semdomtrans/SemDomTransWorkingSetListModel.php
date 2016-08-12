<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MongoMapper;
use Api\Model\ProjectModel;
use MongoDB\BSON\UTCDatetime;

class SemDomTransWorkingSetListModel extends MapperListModel
{
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'semDomTransWorkingSets');
        }

        return $instance;
    }

    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDatetime(1000*$newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate)),  array(), array('name' => 1));
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array(),  array(), array('name' => 1));
        }
    }
}
