<?php

namespace Site\OAuth;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class ParatextOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "paratext";
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
        $provider = new ParatextOAuthProvider([
            'clientId' => 'DbDDp7nAdPYtuJL9L', // TODO: Move to config.php
            'clientSecret' => '',
            'redirectUri' => $redirectUri,
        ]);
        return $provider;
    }


    protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        // TODO: Implement this once Paratext integration is desired
        return new RedirectResponse("/auth/login");
    }

    public function chooseRedirectUrl(bool $tokenSuccess, Application $app) : string
    {
        return '/auth/show_paratext_projects';
    }
}
