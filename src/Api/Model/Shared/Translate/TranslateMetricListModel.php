<?php

namespace Api\Model\Shared\Translate;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use MongoDB\BSON\UTCDateTime;

class TranslateMetricListModel extends MapperListModel
{
    /**
     * @param TranslateProjectModel $project
     * @param int $newerThanTimestamp
     * @internal param string $userId
     */
    public function __construct($project, $newerThanTimestamp = null)
    {
        // for use with readAsModels()
        $this->entries = new ArrayOf(function () use ($project) { return new TranslateMetricModel($project); });

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000*$newerThanTimestamp);
            parent::__construct(self::mapper($project->databaseName()), ['dateModified'=> ['$gte' => $startDate]], []);
        } else {
            parent::__construct(self::mapper($project->databaseName()), [], []);
        }
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'metrics');
        }

        return $instance;
    }
}
