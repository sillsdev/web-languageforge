<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;

class CommentModel
{
    public function __construct()
    {
        $this->id = new Id();
        $this->dateCreated = new \DateTime();
        $this->dateEdited = new \DateTime();
        $this->userRef = new IdReference();
    }

    /** @var Id */
    public $id;

    /** @var string */
    public $content;

    /** @var \DateTime */
    public $dateCreated;

    /** @var \DateTime */
    public $dateEdited;

    /** @var IdReference */
    public $userRef;
}
