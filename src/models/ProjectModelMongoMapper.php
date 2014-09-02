<?php

namespace models;

use models\mapper\MongoMapper;
use models\mapper\MongoStore;

require_once APPPATH . 'models/ProjectModel.php';

class ProjectModelMongoMapper extends \models\mapper\MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new ProjectModelMongoMapper(SF_DATABASE, 'projects');
        }

        return $instance;
    }

    public function drop($databaseName)
    {
        if (MongoStore::hasDB($databaseName)) {
            $db = MongoStore::connect($databaseName);
            $db->drop();
        }
    }
}
