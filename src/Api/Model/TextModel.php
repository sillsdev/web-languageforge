<?php
namespace Api\Model;

use Api\Model\Mapper\Id;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class TextModelMongoMapper extends \Api\Model\Mapper\MongoMapper
{

    /**
     *
     * @var TextModelMongoMapper[]
     */
    private static $_pool = array();

    /**
     *
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

class TextModel extends \Api\Model\Mapper\MapperModel
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
}

class TextListModel extends \Api\Model\Mapper\MapperListModel
{

    public function __construct($projectModel)
    {
        parent::__construct(
            TextModelMongoMapper::connect($projectModel->databaseName()),
            array('title' => array('$regex' => '')),
            array('title')
        );
    }
}
