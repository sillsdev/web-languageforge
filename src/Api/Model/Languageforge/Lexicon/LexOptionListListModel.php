<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MongoMapper;
use MongoDB\BSON\UTCDatetime;

class LexOptionListListModel extends MapperListModel
{
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'optionlists');
        }

        return $instance;
    }

    /**
     * @param LexProjectModel $project
     * @param int $newerThanTimestamp
     */
    public function __construct($project, $newerThanTimestamp = null)
    {
        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDatetime(1000*$newerThanTimestamp);
            parent::__construct( self::mapper($project->databaseName()), array('dateModified'=> array('$gte' => $startDate)), array());
        } else {
            parent::__construct( self::mapper($project->databaseName()), array('name' => array('$regex' => '')));
        }
    }
}
