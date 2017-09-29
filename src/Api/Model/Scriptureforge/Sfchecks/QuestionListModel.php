<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class QuestionListModel extends MapperListModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $textId
     */
    public function __construct($projectModel, $textId)
    {
        parent::__construct(
            QuestionModelMongoMapper::connect($projectModel->databaseName()),
            array('description' => array('$regex' => ''), 'textRef' => MongoMapper::mongoID($textId)),
            array('description')
        );
    }
}
