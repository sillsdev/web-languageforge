<?php
/**
 * Created by PhpStorm.
 * User: rmunn
 * Date: 11/22/17
 * Time: 1:21 PM
 */

namespace Site\OAuth;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Site\OAuth\OAuthBase;
use Site\OAuth\SelectAccountOAuthProvider;
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
