<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class TranslateMetricModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     * @param string $documentSetId
     * @param string $userId
     */
    public function __construct($projectModel, $id = '', $documentSetId = '', $userId = '')
    {
        $this->id = new Id();
        $this->userRef = new IdReference($userId);
        $this->documentSetIdRef = new IdReference($documentSetId);
        $this->metrics = new TranslateMetrics();

        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var Id */
    public $id;

    /** @var IdReference */
    public $userRef;

    /** @var IdReference */
    public $documentSetIdRef;

    /** @var TranslateMetrics */
    public $metrics;

    public static function mapper($databaseName)
    {
        /** @var TranslateMetricsMongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new TranslateMetricsMongoMapper($databaseName, 'metrics');
        }

        return $instance;
    }

    /**
     * Remove this TranslateMetrics from the collection
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public static function remove($projectModel, $id)
    {
        $databaseName = $projectModel->databaseName();
        self::mapper($databaseName)->remove($id);
    }
}

class TranslateMetricsMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [];
}

class TranslateMetrics
{
    /** @var int */
    public $keyBackspaceCount;

    /** @var int */
    public $keyDeleteCount;

    /** @var int */
    public $keyCharacterCount;

    /** @var int */
    public $keyNavigationCount;

    /** @var int */
    public $mouseClickCount;

    /** @var int */
    public $suggestionAcceptedCount;

    /** @var int */
    public $suggestionTotalCount;

    /** @var int [s] */
    public $timeEditActive;

    /** @var int [s] */
    public $timeTotal;
}
