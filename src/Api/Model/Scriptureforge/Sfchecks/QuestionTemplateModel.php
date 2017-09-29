<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class QuestionTemplateModel extends MapperModel
{
    /**
     * QuestionTemplateModel constructor.
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->_projectModel = $projectModel;
        $this->id = new Id();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var IdReference */
    public $id;

    /** @var string */
    public $title;

    /** @var string A content description/explanation of the question being asked */
    public $description;

    /** @var ProjectModel */
    private $_projectModel;

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'questionTemplates');
        }

        return $instance;
    }

    public function remove()
    {
        $result = self::mapper($this->_projectModel->databaseName())->remove($this->id->asString());

        return $result;
    }
}
