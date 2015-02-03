<?php

namespace models\scriptureforge\sfchecks;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;
use models\mapper\IdReference;

class QuestionTemplateModel extends \models\mapper\MapperModel
{
    private $_projectModel;

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'questionTemplates');
        }

        return $instance;
    }

    public function __construct($projectModel, $id = '')
    {
        $this->_projectModel = $projectModel;
        $this->id = new Id();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    public function remove()
    {
        $result = self::mapper($this->_projectModel->databaseName())->remove($this->id->asString());

        return $result;
    }

    /**
     * @var IdReference
     */
    public $id;

    /**
     * @var string
     */
    public $title;

    /**
     * @var string A content description/explanation of the question being asked
     */
    public $description;
}
