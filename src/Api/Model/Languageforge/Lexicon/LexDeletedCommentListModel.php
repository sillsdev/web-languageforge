<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use MongoDB\BSON\UTCDateTime;

class LexDeletedCommentListModel extends MapperListModel
{
    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        new LexProjectModel($projectModel->id->asString());

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000 * $newerThanTimestamp);
            parent::__construct(
                self::mapper($projectModel->databaseName()),
                ["isDeleted" => true, "dateModified" => ['$gte' => $startDate]],
                []
            );
        } else {
            parent::__construct(self::mapper($projectModel->databaseName()), ["isDeleted" => true], []);
        }
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, "lexiconComments");
        }

        return $instance;
    }
}
