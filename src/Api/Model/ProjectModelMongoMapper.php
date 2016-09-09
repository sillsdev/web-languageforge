<?php

namespace Api\Model;

use Api\Model\Mapper\MongoMapper;

require_once APPPATH . 'Api/Model/ProjectModel.php';

class ProjectModelMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [
        ['key' => ['projectCode' => 1], 'unique' => true]
    ];

    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new ProjectModelMongoMapper(SF_DATABASE, 'projects');
        }

        return $instance;
    }
}
