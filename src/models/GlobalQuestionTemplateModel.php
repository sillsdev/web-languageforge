<?php

namespace models;

// TODO: this class should be deleted after migration question templates to the project model

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\MapperListModel;
use models\mapper\Id;
use models\mapper\IdReference;

class GlobalQuestionTemplateModelMongoMapper extends \models\mapper\MongoMapper
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

class GlobalQuestionTemplateModel extends \models\mapper\MapperModel
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

class GlobalQuestionTemplateListModel extends \models\mapper\MapperListModel
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
