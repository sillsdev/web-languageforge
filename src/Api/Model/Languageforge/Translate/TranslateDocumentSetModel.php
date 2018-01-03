<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class TranslateDocumentSetModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->setReadOnlyProp('isDeleted');
        $this->id = new Id();
        $this->isDeleted = false;

        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var Id */
    public $id;

    /** @var string */
    public $name;

    /** @var boolean */
    public $isDeleted;

    public static function mapper($databaseName)
    {
        /** @var TranslateDocumentSetMongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new TranslateDocumentSetMongoMapper($databaseName, 'translate');
        }

        return $instance;
    }

    /**
     * Remove this TranslateDocument from the collection
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public static function remove($projectModel, $id)
    {
        $databaseName = $projectModel->databaseName();
        self::mapper($databaseName)->remove($id);
    }
}

class TranslateDocumentSetMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [];
}
