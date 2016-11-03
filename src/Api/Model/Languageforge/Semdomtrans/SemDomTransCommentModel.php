<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;

class SemDomTransCommentModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->content = '';
        $this->regarding = new SemDomTransFieldReference();
        $this->entryRef = new Id();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }
    
    /** @var Id */
    public $id;

    /** @var IdReference */
    public $entryRef;

    /** @var SemDomTransFieldReference */
    public $regarding;

    /** @var string */
    public $content;

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'semdomTransComments');
        }

        return $instance;
    }
}
