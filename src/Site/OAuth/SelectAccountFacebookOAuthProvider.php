<?php

namespace Site\OAuth;

use League\OAuth2\Client\Provider\Facebook as FacebookOAuthProvider;

class SelectAccountFacebookOAuthProvider extends FacebookOAuthProvider
{
    // Commented out 2019-07-30 by Robin Munn - let's see if it's needed for Facebook
//    use SelectAccountAuthorizationParametersTrait;
}
