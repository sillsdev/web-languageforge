<?php

namespace Api\Model\Languageforge\Lexicon;

class SendReceiveProjectModelWithIdentifier extends SendReceiveProjectModel
{
    public function __construct($identifier = "", $name = "", $repository = "", $role = "")
    {
        parent::__construct($name, $repository, $role);
        $this->identifier = $identifier;
    }

    /** @var string Language Depot project identifier */
    public $identifier;
}
