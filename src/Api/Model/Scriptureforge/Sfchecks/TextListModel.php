<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\ProjectModel;

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
