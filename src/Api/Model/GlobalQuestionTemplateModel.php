<?php

namespace Api\Model;

// TODO: this class should be deleted after migration question templates to the project model

use Api\Model\Mapper\MongoMapper;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MapperListModel;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\IdReference;

class GlobalQuestionTemplateModelMongoMapper extends \Api\Model\Mapper\MongoMapper
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

class GlobalQuestionTemplateModel extends \Api\Model\Mapper\MapperModel
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

    /**
     * @var IdReference
     */
    public $id;

    /**
     * @var string
     */
    public $title;

    /**
     * @var string A content description/explanation of the question being asked
     */
    public $description;
}

class GlobalQuestionTemplateListModel extends \Api\Model\Mapper\MapperListModel
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
