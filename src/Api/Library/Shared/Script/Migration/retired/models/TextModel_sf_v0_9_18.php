<?php

namespace Api\Library\Shared\Script\Migration\models;

use Api\Model\Scriptureforge\Sfchecks\QuestionAnswersListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionListModel;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\ProjectModel;

require_once APPPATH . 'Api/Model/Shared/ProjectModel.php';

class TextModelMongoMapper_sf_v0_9_18 extends \Api\Model\Shared\Mapper\MongoMapper
{
    /**
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

    /** @var TextModelMongoMapper_sf_v0_9_18[] */
    private static $_pool = array();
}

class TextModel_sf_v0_9_18 extends \Api\Model\Shared\Mapper\MapperModel
{
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->_projectModel = $projectModel;
        $this->isArchived = false;
        $databaseName = 'sf_jamaican_psalms';
        parent::__construct(TextModelMongoMapper_sf_v0_9_18::connect($databaseName), $id);
    }

    public $id;

    public $title;

    public $audioUrl;

    public $content;

    public $isArchived;

    /** @var ProjectModel */
    private $_projectModel;

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
}

class TextListModel_sf_v0_9_18 extends MapperListModel
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
