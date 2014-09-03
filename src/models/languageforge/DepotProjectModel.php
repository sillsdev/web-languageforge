<?php

namespace models;

use models\mapper\Id;

//TODO how can I get data with out this?
class DepotProjectModelMongoMapper extends \models\mapper\MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new DepotProjectModelMongoMapper(LF_DATABASE, 'depot');
        }

        return $instance;
    }

}

class DepotProjectModel extends \models\mapper\MapperModel
{
    public function __construct()
    {
        $this->id = new Id();
        parent::__construct(DepotProjectModelMongoMapper::instance());
    }

    /**
     * @var IdReference
     */
    public $id;

    /**
     *
     * @var string
     */
    public $projectlanguagecode;

    /**
     *
     * @var string
     */
    public $projectname;

    /**
     * @var string
     */
    public $projectcode;

    /**
     * @var string
     */
    public $projectusername;

    /**
     * @var string
     */
    public $projectpassword;

    /**
     *
     * @var string
     */
    public $captcha_challenge;

    /**
     *
     * @var string
     */
    public $captcha_response;

}
