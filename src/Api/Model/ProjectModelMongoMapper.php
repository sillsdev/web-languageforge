<?php

namespace Api\Model;

use Api\Model\Mapper\MongoMapper;
use Api\Model\Mapper\MongoStore;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class ProjectModelMongoMapper extends \Api\Model\Mapper\MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new ProjectModelMongoMapper(SF_DATABASE, 'projects');
        }

        return $instance;
    }
}
