<?php

namespace models\languageforge\semdomtrans;

use models\mapper\Id;

use models\mapper\MapOf;

use models\languageforge\SemDomTransProjectModel;
use models\mapper\ArrayOf;
use models\ProjectModel;

class SemDomTransWorkingSetModel extends \models\mapper\MapperModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'semDomTransWorkingSets');
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
