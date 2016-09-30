<?php

namespace Api\Model;

use Api\Model\Mapper\Id;
use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MongoMapper;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class TextModelMongoMapper extends MongoMapper
{
    /** @var TextModelMongoMapper[] */
    private static $_pool = array();

    /**
     * @param string $databaseName
     * @return TextModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (! isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new TextModelMongoMapper($databaseName, 'texts');
        }
        return static::$_pool[$databaseName];
    }
}

class TextModel extends MapperModel
{
    /** @var ProjectModel */
    private $_projectModel;

    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->_projectModel = $projectModel;
        $this->isArchived = false;
        $databaseName = $projectModel->databaseName();
        parent::__construct(TextModelMongoMapper::connect($databaseName), $id);
    }

    public static function remove($databaseName, $id)
    {
        TextModelMongoMapper::connect($databaseName)->remove($id);
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

    public $audioFileName;

    public $content;

    public $isArchived;

    /**
     * @var string - the font-family CSS string used in the Text div.  This is optional, for cases where font-fallback is not working properly or a font-family preference is needed
     */
    public $fontfamily;
}

class TextListModel extends MapperListModel
{
    /**
     * TextListModel constructor.
     * @param ProjectModel $project
     */
    public function __construct($project)
    {
        parent::__construct(
            TextModelMongoMapper::connect($project->databaseName()),
            array('title' => array('$regex' => '')),
            array('title')
        );
    }
}
