<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class SemDomTransWorkingSetModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string       $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->itemKeys = new ArrayOf();
        $this->name = "";
        
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var Id */
    public $id;
    
    /** @var string */
    public $name;
    
    /** @var boolean */
    public $isShared;
   
    /** @var ArrayOf<String> */
    public $itemKeys;

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'semDomTransWorkingSets');
        }

        return $instance;
    }
}
