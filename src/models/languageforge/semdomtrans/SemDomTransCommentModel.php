<?php

namespace models\languageforge\semdomtrans;

use models\mapper\ArrayOf;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MapOf;

class SemDomTransCommentModel extends \models\mapper\MapperModel
{

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'semdomTransComments');
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
