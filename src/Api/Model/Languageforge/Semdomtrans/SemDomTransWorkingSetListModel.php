<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use MongoDB\BSON\UTCDateTime;

class SemDomTransWorkingSetListModel extends MapperListModel
{
    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000*$newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate)),  array(), array('name' => 1));
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array(),  array(), array('name' => 1));
        }
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'semDomTransWorkingSets');
        }

        return $instance;
    }
}
