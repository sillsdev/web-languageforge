<?php

namespace Api\Model\Shared;

use Api\Model\Languageforge\Lexicon\LexRoles;

class InviteToken
{

    public function __construct() {

    }

    /** @var string */
    public $token;

    /** @var LexRole */
    public $defaultRole;

    /** @var boolean */
    public $isEnabled;
}
