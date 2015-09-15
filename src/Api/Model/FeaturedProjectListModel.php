<?php
namespace Api\Model;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class FeaturedProjectListModel extends \Api\Model\Mapper\MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            ProjectModelMongoMapper::instance(),
            array('featured' => true),
            array('projectName', 'language')
        );
    }
}
