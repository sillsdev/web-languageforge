<?php
namespace models\lex;

use models\mapper\ArrayOf;

class LexEntryId
{
    /**
     * @var string
     */
    public $id;

    /**
     * @var string
     */
    public $mercurialSha;

}

class LexEntryIds
{
    public $ids;

    public function __construct()
    {
        $this->ids = new ArrayOf(
            function ($data) {
                return new LexEntryId();
            }
        );
    }

}
