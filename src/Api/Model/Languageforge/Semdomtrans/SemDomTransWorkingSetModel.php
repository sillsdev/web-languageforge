<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;
use Api\Model\ProjectModel;

class SemDomTransWorkingSetModel extends \Api\Model\Mapper\MapperModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'semDomTransWorkingSets');
        }

        return $instance;
    }

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

    /**
     * @var Id
     */
    public $id;
    
    /**
     * @var string
     */
    public $name;
    
    /**
     * @var boolean
     */
    public $isShared;
   
    /**
     * @var ArrayOf(String)
     */
    public $itemKeys;
    
    
 }
