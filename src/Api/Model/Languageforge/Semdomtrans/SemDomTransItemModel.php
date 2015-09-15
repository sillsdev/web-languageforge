<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;
use Api\Model\ProjectModel;

class SemDomTransItemModel extends \Api\Model\Mapper\MapperModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'semDomTransItems');
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
        $this->key = "";
        $this->name = new SemDomTransTranslatedForm();
        $this->description = new SemDomTransTranslatedForm();
        $this->searchKeys = new ArrayOf(function ($data) {
            return new SemDomTransTranslatedForm();
        });
        
        $this->questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        
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
    public $key;
    
    /**
     * @var SemDomTransTranslatedForm
     */
    public $name;
    
    /**
     * @var SemDomTransTranslatedForm
     */
    public $description;
    
    /**
     * @var ArrayOf(SemDomTransTranslatedForm)
     */
    public $searchKeys;
    
    /**
     * @var ArrayOf(SemDomTransQuestion)
     */
    public $questions;
    
    public $xmlGuid;
    
 }
