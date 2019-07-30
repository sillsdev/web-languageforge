<?php

namespace Api\Model\Shared;

use Api\Model\Languageforge\Lexicon\LexRoles;

class InviteLink
{

    public function __construct() {

    }

    /** @var string */
    public $authToken;

    /** @var LexRole */
    public $defaultRole;

    /** @var boolean */
    public $isEnabled;
}
