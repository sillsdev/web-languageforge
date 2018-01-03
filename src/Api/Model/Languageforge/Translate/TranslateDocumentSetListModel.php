<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use MongoDB\BSON\UTCDateTime;

class TranslateDocumentSetListModel extends MapperListModel
{
    /**
     * @param TranslateProjectModel $project
     * @param int $newerThanTimestamp
     */
    public function __construct($project, $newerThanTimestamp = null)
    {
        // for use with readAsModels()
        $this->entries = new ArrayOf(function () use ($project) { return new TranslateDocumentSetModel($project); });

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000*$newerThanTimestamp);
            parent::__construct(self::mapper($project->databaseName()), ['dateModified'=> ['$gte' => $startDate], 'isDeleted' => false], []);
        } else {
            parent::__construct(self::mapper($project->databaseName()), ['isDeleted' => false], []);
        }
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'translate');
        }

        return $instance;
    }
}
