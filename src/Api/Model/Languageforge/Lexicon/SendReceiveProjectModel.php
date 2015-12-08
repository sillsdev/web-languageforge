<?php

namespace Api\Model\Languageforge\Lexicon;

class SendReceiveProjectModel
{
    public function __construct($identifier = '', $name = '', $repository = '', $role = '')
    {
        $this->identifier = $identifier;
        $this->name = $name;
        $this->repository = $repository;
        $this->role = $role;
    }

    /**
     * @var string Language Depot project identifier
     */
    public $identifier;

    /**
     * @var string Language Depot project name
     */
    public $name;

    /**
     * @var string Language Depot project repository
     */
    public $repository;

    /**
     * @var string disambiguates private and public repos with identical identifiers
     */
    public $repoClarification;

    /**
     * @var string Language Depot project role
     */
    public $role;
}
