<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class SemDomTransItemModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->key = '';
        $this->name = new SemDomTransTranslatedForm();
        $this->description = new SemDomTransTranslatedForm();
        $this->searchKeys = new ArrayOf(function () {
            return new SemDomTransTranslatedForm();
        });
        
        $this->questions = new ArrayOf(function () {
            return new SemDomTransQuestion();
        });
        
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var Id */
    public $id;
    
    /** @var string */
    public $key;
    
    /** @var SemDomTransTranslatedForm */
    public $name;
    
    /** @var SemDomTransTranslatedForm */
    public $description;
    
    /** @var ArrayOf<SemDomTransTranslatedForm> */
    public $searchKeys;
    
    /** @var ArrayOf<SemDomTransQuestion> */
    public $questions;
    
    public $xmlGuid;

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'semDomTransItems');
        }

        return $instance;
    }
}
