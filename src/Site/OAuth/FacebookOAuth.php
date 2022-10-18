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
use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

class FacebookOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "facebook";
    }

    public function getFullSizeAvatarUrl(string $avatarUrl)
    {
        // Facebook avatar URL returned from OAuth looks like
        // https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10218006774054654&height=200&width=200&ext=1568255043&hash=AeRaWctQlN6CA17U
        // Facebook docs say to GET https://graph.facebook.com/v4.0/{user-id}/picture to get the actual URL
        $queryStr = parse_url($avatarUrl, PHP_URL_QUERY);
        if ($queryStr == null) {
            return $avatarUrl;
        }
        $query = [];
        parse_str($queryStr, $query);
        if (array_key_exists("asid", $query)) {
            $userId = $query["asid"];
            $url = "https://graph.facebook.com/v4.0/$userId/picture";
            return $url;
        } else {
            return $avatarUrl;
        }
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
            "clientId" => Env::requireEnv("FACEBOOK_CLIENT_ID"),
            "clientSecret" => Env::requireEnv("FACEBOOK_CLIENT_SECRET"),
            "redirectUri" => $redirectUri,
            "graphApiVersion" => "v4.0",
        ]);
        return $provider;
    }
}
