<?php

namespace Api\Model;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class ProjectListModel extends \Api\Model\Mapper\MapperListModel
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
