<?php
namespace libraries\shared\scripts\migration\models;

use models\mapper\Id;

require_once APPPATH . 'models/ProjectModel.php';

class TextModelMongoMapper_sf_v0_9_18 extends \models\mapper\MongoMapper
{

    /**
     *
     * @var TextModelMongoMapper_sf_v0_9_18[]
     */
    private static $_pool = array();

    /**
     *
     * @param string $databaseName
     * @return TextModelMongoMapper_sf_v0_9_18
     */
    public static function connect($databaseName)
    {
        if (! isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new TextModelMongoMapper_sf_v0_9_18($databaseName, 'texts');
        }
        return static::$_pool[$databaseName];
    }
}

class TextModel_sf_v0_9_18 extends \models\mapper\MapperModel
{

    /**
     *
     * @var ProjectModel;
     */
    private $_projectModel;

    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->_projectModel = $projectModel;
        $this->isArchived = false;
        $databaseName = 'sf_jamaican_psalms';
        parent::__construct(TextModelMongoMapper_sf_v0_9_18::connect($databaseName), $id);
    }

    public static function remove($databaseName, $id)
    {
        TextModelMongoMapper_sf_v0_9_18::connect($databaseName)->remove($id);
    }

    public static function removeAudioProperty($databaseName) {
        TextModelMongoMapper_sf_v0_9_18::connect($databaseName)->removeProperty('audioUrl');
    }

    public function listQuestions()
    {
        $questionList = new QuestionListModel($this->_projectModel, $this->id->asString());
        $questionList->read();

        return $questionList;
    }

    public function listQuestionsWithAnswers()
    {
        $questionList = new QuestionAnswersListModel($this->_projectModel, $this->id->asString());
        $questionList->read();

        return $questionList;
    }

    public $id;

    public $title;

    public $audioUrl;

    public $content;

    public $isArchived;
}

class TextListModel_sf_v0_9_18 extends \models\mapper\MapperListModel
{

    public function __construct($projectModel)
    {
        parent::__construct(
            TextModelMongoMapper_sf_v0_9_18::connect('sf_jamaican_psalms'),
            array('title' => array('$regex' => '')),
            array('title')
        );
    }
}
