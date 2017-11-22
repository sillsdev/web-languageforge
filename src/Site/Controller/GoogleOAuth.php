<?php

namespace Site\Controller;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Google as GoogleOAuthProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Site\OAuth\SelectAccountAuthorizationParameters;
use Symfony\Component\HttpFoundation\Request;

class SelectAccountOAuthProvider extends GoogleOAuthProvider
{
    use SelectAccountAuthorizationParameters;
}

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

    /**
     * @param $redirectUri
     * @return AbstractProvider
     */
    protected function getOAuthProvider($redirectUri): AbstractProvider
    {
        $provider = new SelectAccountOAuthProvider([
            'clientId' => GOOGLE_CLIENT_ID,
            'clientSecret' => GOOGLE_CLIENT_SECRET,
            'redirectUri' => $redirectUri,
        ]);
        return $provider;
    }
}
