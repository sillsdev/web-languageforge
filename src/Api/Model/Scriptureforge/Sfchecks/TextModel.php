<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\ProjectModel;

class TextModel extends MapperModel
{
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

    /** @var Id */
    public $id;

    /** @var  string */
    public $title;

    /** @var string */
    public $audioFileName;

    /** @var string */
    public $content;

    /** @var boolean */
    public $isArchived;

    /** @var string - the font-family CSS string used in the Text div.
     * This is optional, for cases where font-fallback is not working properly or a font-family preference is needed
     */
    public $fontfamily;

    /** @var ProjectModel */
    private $_projectModel;

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
}
