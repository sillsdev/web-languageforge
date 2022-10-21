<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use MongoDB\BSON\UTCDateTime;

class LexOptionListListModel extends MapperListModel
{
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, "optionlists");
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
            $startDate = new UTCDateTime(1000 * $newerThanTimestamp);
            parent::__construct(self::mapper($project->databaseName()), ["dateModified" => ['$gte' => $startDate]], []);
        } else {
            parent::__construct(self::mapper($project->databaseName()), ["name" => ['$regex' => ""]]);
        }
    }
}
