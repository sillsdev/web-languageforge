<?php

namespace models;

require_once APPPATH . 'models/ProjectModel.php';

class ProjectListModel extends \models\mapper\MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            ProjectModelMongoMapper::instance(),
            array(),
            array('projectName', 'language')
        );
    }
}
