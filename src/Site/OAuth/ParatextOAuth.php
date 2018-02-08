<?php

namespace Site\OAuth;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Shared\AccessTokenModel;
use Api\Model\Shared\UserModel;
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
            'clientId' => PARATEXT_CLIENT_ID,
            'clientSecret' => '',
            'redirectUri' => $redirectUri,
        ]);
        return $provider;
    }

    protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        $userId = SilexSessionHelper::getUserId($app);
        $user = new UserModel($userId);
        $user->paratextAccessToken->accessToken = $token->getToken();
        $user->paratextAccessToken->refreshToken = $token->getRefreshToken();
        $user->paratextAccessToken->idToken = $token->getValues()['id_token'];
        $user->write();
        OAuthBase::removeOAuthKeysFromSession($app['session']);
        return '<!DOCTYPE html><html><script>window.close();</script></html>';
    }
}
