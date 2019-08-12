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
use Site\OAuth\SelectAccountFacebookOAuthProvider;
use Symfony\Component\HttpFoundation\Request;

class FacebookOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "facebook";
    }

    public function getFullSizeAvatarUrl(string $avatarUrl)
    {
        // TODO: Learn what Facebook avatar URLs look like
        return $avatarUrl;
    }

    protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        error_log("Handling Facebook OAuth token");
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
        $provider = new SelectAccountFacebookOAuthProvider([
            'clientId' => FACEBOOK_CLIENT_ID,
            'clientSecret' => FACEBOOK_CLIENT_SECRET,
            'redirectUri' => $redirectUri,
            'graphApiVersion' => 'v4.0',
        ]);
        return $provider;
    }
}
