<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;

require_once 'QuestionModel.php';

class QuestionAnswersListModel extends MapperListModel
{
    /**
     * QuestionAnswersListModel constructor.
     * @param MapperModel $projectModel
     * @param array $textId
     */
    public function __construct($projectModel, $textId)
    {
        parent::__construct(
            QuestionModelMongoMapper::connect($projectModel->databaseName()),
            array('description' => array('$regex' => ''), 'textRef' => MongoMapper::mongoID($textId)),
            array('title', 'description', 'answers', 'isArchived'),
            array('dateCreated' => -1)
        );
    }
}
