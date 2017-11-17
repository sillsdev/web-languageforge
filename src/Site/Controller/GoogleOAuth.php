<?php

namespace Site\Controller;

use Api\Model\Shared\UserModel;
use League\OAuth2\Client\Provider\Google;
use Silex\Application;
use Site\Model\UserWithId;
use Site\Provider\AuthUserProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class SelectAccountOAuthProvider extends Google
{
    protected function getAuthorizationParameters(array $options)
    {
        // Default provider adds "approval_prompt=auto", but using both "prompt" and "approval_prompt" together is not allowed
        $params = parent::getAuthorizationParameters($options);
        $params['prompt'] = 'select_account';
        unset($params['approval_prompt']);
        return $params;
    }
}

class GoogleOAuth extends Base
{
    const SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK = 'oauthTokenIdToLink';
    const SESSION_KEY_OAUTH_PROVIDER = 'oauthProvider';
    const SESSION_KEY_OAUTH_EMAIL_ADDRESS = 'oauthEmailAddress';
    const SESSION_KEY_OAUTH_FULL_NAME = 'oauthFullName';

    public function oauthCallback(Request $request, Application $app)
    {
        $provider = new SelectAccountOAuthProvider([
            'clientId'     => GOOGLE_CLIENT_ID,
            'clientSecret' => GOOGLE_CLIENT_SECRET,
            'redirectUri'  => 'https://localdev.scriptureforge.org/oauthcallback',
        ]);

        $error = $request->query->get('error', null);
        if (! is_null($error)) {
            if ($error === 'immediate_failed') {
                // Not a problem; this just means that the user wasn't logged in elsewhere.
                $authUrl = $provider->getAuthorizationUrl();
                $app['session']->set('oauth2state', $provider->getState());
                return new RedirectResponse($authUrl);
            }
            return new Response('OAuth error ' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8'), 200);
        }
        if ($app['session']->has('oauthtoken')) {
            $token = $app['session']->get('oauthtoken');
        } else {
            $code = $request->query->get('code', null);
            if (is_null($code)) {   //
                $authUrl = $provider->getAuthorizationUrl(["prompt" => "select_account"]);
                $app['session']->set('oauth2state', $provider->getState());
                return new RedirectResponse($authUrl);
            } else {
                $state = $request->query->get('state', null);
                if (is_null($state) || ($state !== $app['session']->get('oauth2state'))) {
                    // Invalid state, which *could* indicate some kind of attempted hack (CSRF, etc.)
                    $app['session']->remove('oauth2state');
                    return new Response('DEBUG: Invalid OAuth state', 200);  // TODO: determine how to handle this scenario
                }
                if ($app['session']->has('oauthtoken')) {
                    $token = $app['session']->get('oauthtoken');
                } else {
                    $token = $provider->getAccessToken('authorization_code', [
                        'code' => $code
                    ]);
                    $app['session']->set('oauthtoken', $token);
                    $app['session']->set('oauthprovider', 'google');  // TODO: Once we add Facebook, make a getProviderName() method that subclasses will override
                }
            }
        }
        try {
            $userDetails = $provider->getResourceOwner($token);

            // Look up UserModel with incoming oauthId
            $userModel = new UserModel();
            $googleOAuthId = $userDetails->getId();
            $userModel->readByPropertyArrayContains('googleOAuthIds', $googleOAuthId);
            if (!$userModel->id->asString()) {
                // No user has this OAuth ID
                $userModel->readByEmail($userDetails->getEmail());
                if (!$userModel->id->asString()) {
                    // And no match by email either

                    // Pass all OAuth information into the "what next?" page via the session, so that the user doesn't see it in the login page URL
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK, $googleOAuthId);
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_PROVIDER, 'google');
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_EMAIL_ADDRESS, $userDetails->getEmail());
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_FULL_NAME, $userDetails->getName());

                    // We'll ask the user to either link existing account or create a new account
                    return new RedirectResponse('/auth/link_oauth_account');
                } else {
                    // Found an email address matching this OAuth token, so add the token
                    $userModel->googleOAuthIds[] = $googleOAuthId;
                    $userModel->write();
                    $success = $this->setSilexAuthToken($userModel, $app);
                    $redirectUrl = $this->chooseRedirectUrl($success, $app);
                    return new RedirectResponse($redirectUrl);
                }
            } else {
                // OAuth ID found in our user model
                $success = $this->setSilexAuthToken($userModel, $app);
                $redirectUrl = $this->chooseRedirectUrl($success, $app);
                return new RedirectResponse($redirectUrl);
            }
        } catch (Exception $e) {
            return new Response('DEBUG: Failure getting user details', 200);  // TODO: determine how to handle this scenario
        }
    }

    public function setSilexAuthToken(UserModel $userModel, Application $app): string
    {
        $roles = AuthUserProvider::getSiteRoles($userModel, $app['website']);
        $oauthUser = new UserWithId($userModel->username, '', $userModel->username, $roles);
        $oauthToken = new UsernamePasswordToken($oauthUser, '', 'site', $oauthUser->getRoles());
        $tokenStorage = $app['security.token_storage'];
        if (!is_null($tokenStorage) && $tokenStorage instanceof TokenStorageInterface) {
            $tokenStorage->setToken($oauthToken);
            return true;
        } else {
            // OAuth authentication succeeded, but we failed to set the Silex auth token.
            $app['session']->getFlashBag()->add('errorMessage', 'Sorry, we couldn\'t process the Google login data. This may be a temporary failure, so please try again. If the problem persists, try logging in with a username and password instead.');
            return false;
        }
    }

    public function chooseRedirectUrl(bool $tokenSuccess, Application $app) : string
    {
        if ($tokenSuccess) {
            return '/';
        } else {
            if (isset($app['security.firewalls']['site']['form']['login_path'])) {
                return $app['security.firewalls']['site']['form']['login_path'];
            } else {
                return '/auth/login';  // Fallback
            }
        }
    }
}
