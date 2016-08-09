<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\MongoMapper;

class QuestionTemplateListModel extends MapperListModel
{
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
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
