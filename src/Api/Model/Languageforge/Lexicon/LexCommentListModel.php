<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use MongoDB\BSON\UTCDateTime;

class LexCommentListModel extends MapperListModel
{
    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     * @param int $limit
     * @param int $skip
     */
    public function __construct($projectModel, $newerThanTimestamp = null, $limit = 0, $skip = 0)
    {
        $this->entries = new ArrayOf(function () use ($projectModel) {
            return new LexCommentModel($projectModel);
        });
        // sort ascending by creation date
        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime($newerThanTimestamp * 1000);
            parent::__construct(
                self::mapper($projectModel->databaseName()),
                ["isDeleted" => false, "dateModified" => ['$gte' => $startDate]],
                [],
                ["dateCreated" => 1],
                $limit,
                $skip
            );
        } else {
            parent::__construct(
                self::mapper($projectModel->databaseName()),
                ["isDeleted" => false],
                [],
                ["dateCreated" => 1],
                $limit,
                $skip
            );
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
