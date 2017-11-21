<?php

namespace Site\Controller;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class GoogleOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "google";
    }

    protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        return $this->loginWithOAuthToken($app, $provider, $token);
    }

    public function oauthCallback(Request $request, Application $app)
    {
        return parent::oauthCallback($request, $app);
    }
}
