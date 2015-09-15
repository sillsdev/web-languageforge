<?php

namespace Api\Model\Languageforge\Semdomtrans;

use Api\Model\Mapper\Id;
use Api\Model\Mapper\IdReference;

class SemDomTransCommentModel extends \Api\Model\Mapper\MapperModel
{

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'semdomTransComments');
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
        $this->content = '';
        $this->regarding = new SemDomTransFieldReference();
        $this->entryRef = new Id();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }
    
    /**
     * @var Id
     */
    public $id;

    /**
     * @var IdReference
     */
    public $entryRef;

    /**
     *
     * @var SemDomTransCommentFieldReference
     */
    public $regarding;
    /**
     * @var string
     */
    public $content;
}
