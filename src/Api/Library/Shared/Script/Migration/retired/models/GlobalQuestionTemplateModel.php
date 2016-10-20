<?php

namespace Api\Library\Shared\Script\Migration\retired\models;

// TODO: this class should be deleted after migration question templates to the project model

use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;

class GlobalQuestionTemplateModelMongoMapper extends MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new GlobalQuestionTemplateModelMongoMapper(SF_DATABASE, 'questiontemplates');
        }

        return $instance;
    }
}

class GlobalQuestionTemplateModel extends MapperModel
{
    public function __construct($id = '')
    {
        $this->id = new Id();
        parent::__construct(GlobalQuestionTemplateModelMongoMapper::instance(), $id);
    }

    public function remove()
    {
        $result = GlobalQuestionTemplateModelMongoMapper::instance()->remove($this->id->asString());

        return $result;
    }

    /** @var IdReference */
    public $id;

    /** @var string */
    public $title;

    /** @var string A content description/explanation of the question being asked */
    public $description;
}

class GlobalQuestionTemplateListModel extends MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            GlobalQuestionTemplateModelMongoMapper::instance(),
            array(),
            array('title', 'description')
        );
    }
}
