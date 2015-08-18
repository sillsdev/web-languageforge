<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Mapper\MongoMapper;

class QuestionTemplateListModel extends \Api\Model\Mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new MongoMapper($databaseName, 'questionTemplates');
        }

        return $instance;
    }

    public function __construct($projectModel)
    {
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName),
            array(),
            array('title', 'description')
        );
    }
}
