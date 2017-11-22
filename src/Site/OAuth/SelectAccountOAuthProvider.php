<?php

namespace Site\OAuth;

use League\OAuth2\Client\Provider\Google as GoogleOAuthProvider;
use Site\OAuth\SelectAccountAuthorizationParameters;

class SelectAccountOAuthProvider extends GoogleOAuthProvider
{
    use SelectAccountAuthorizationParameters;
}
