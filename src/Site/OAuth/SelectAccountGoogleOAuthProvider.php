<?php

namespace Site\OAuth;

use League\OAuth2\Client\Provider\Google as GoogleOAuthProvider;

class SelectAccountGoogleOAuthProvider extends GoogleOAuthProvider
{
    use SelectAccountAuthorizationParametersTrait;
}
