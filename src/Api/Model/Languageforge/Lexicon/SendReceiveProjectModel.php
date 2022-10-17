<?php

namespace Api\Model\Languageforge\Lexicon;

class SendReceiveProjectModel
{
    public function __construct($name = "", $repository = "", $role = "")
    {
        $this->name = $name;
        $this->repository = $repository;
        $this->role = $role;
    }

    /** @var string Language Depot project name */
    public $name;

    /** @var string Language Depot project repository */
    public $repository;

    /** @var string Language Depot project role */
    public $role;
}
