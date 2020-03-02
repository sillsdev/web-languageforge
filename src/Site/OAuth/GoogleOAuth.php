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
use Site\OAuth\SelectAccountGoogleOAuthProvider;
use Symfony\Component\HttpFoundation\Request;

class GoogleOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "google";
    }

    public function getFullSizeAvatarUrl(string $avatarUrl)
    {
        // Google OAuth gives you avatar URLs that end in "?sz=50", but we want to specify our own size
        $fullSizeUrl = preg_replace("/\\?sz=\\d+$/", "", $avatarUrl);
        return is_null($fullSizeUrl) ? $avatarUrl : $fullSizeUrl;
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
        $provider = new SelectAccountGoogleOAuthProvider([
            'clientId' => GOOGLE_CLIENT_ID,
            'clientSecret' => GOOGLE_CLIENT_SECRET,
            'redirectUri' => $redirectUri,
        ]);
        return $provider;
    }
}
