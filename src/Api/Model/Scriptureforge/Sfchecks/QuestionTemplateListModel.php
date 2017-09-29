<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class QuestionTemplateListModel extends MapperListModel
{
    /**
     * QuestionTemplateListModel constructor.
     * @param ProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName),
            array(),
            array('title', 'description')
        );
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'questionTemplates');
        }

        return $instance;
    }
}
