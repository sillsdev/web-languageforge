<?php

namespace Site\Controller;

use Api\Model\Shared\UserModel;
use Silex\Application;
use Site\Model\UserWithId;
use Site\Provider\AuthUserProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class GoogleOAuth extends Base
{
    const SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK = 'oauthTokenIdToLink';
    const SESSION_KEY_OAUTH_PROVIDER = 'oauthProvider';
    const SESSION_KEY_OAUTH_EMAIL_ADDRESS = 'oauthEmailAddress';
    const SESSION_KEY_OAUTH_FULL_NAME = 'oauthFullName';

    public function oauthCallback(Request $request, Application $app)
    {
        $provider = new \League\OAuth2\Client\Provider\Google([
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
                // OAuth library automatically sets approval_prompt parameter and doesn't have an option to remove it,
                // but "prompt" and "approval_prompt" are not allowed to both appear in the same OAuth query.
                $authUrl = str_replace("&approval_prompt=auto", "", $authUrl);
                $authUrl = str_replace("?approval_prompt=auto&", "?", $authUrl);
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

            // look up UserModel with incoming oauthId
            $userModel = new UserModel();
            $googleOAuthId = $userDetails->getId();
            $userModel->readByPropertyArrayContains('googleOAuthIds', $googleOAuthId);
            if (!$userModel->id->asString()) {
                $userModel->readByEmail($userDetails->getEmail());
                if (!$userModel->id->asString()) {
                    // no match found in database.  What should we do?
                    // - present UI for create new account or login to link existing account
                    //      - automatically create a new xForge account with user details (button 1)
                    //      - account linking (includes xforge login form + option to update email address on account - button 2)

                    // Pass all OAuth information into the "what next?" page via the session, so that the user doesn't see it in the login page URL
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK, $googleOAuthId);
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_PROVIDER, 'google');
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_EMAIL_ADDRESS, $userDetails->getEmail());
                    $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_FULL_NAME, $userDetails->getName());

                    // redirect to UI for creating new account

                    return new RedirectResponse('/auth/link_oauth_account');
                } else {
                    // Found an email address matching this OAuth token
                    $userModel->googleOAuthIds[] = $googleOAuthId;
                    $userModel->write();
                    $redirectUrl = $this->setTokenAndCalculateRedirectDestination($userModel, $app);
                    return new RedirectResponse($redirectUrl);
                }
            } else {
                // Found valid user
                $redirectUrl = $this->setTokenAndCalculateRedirectDestination($userModel, $app);
                return new RedirectResponse($redirectUrl);
            }

            // if we find a user with incoming oauthId, get that user model

            // if no user found, find user by email provided by oauth, then get that user model

            // then do automatic login, but instead of a login POST, we'll just store the security token that Symfony expects
            // (See http://symfony.com/doc/current/testing/http_authentication.html#creating-the-authentication-token for details)

        } catch (Exception $e) {
            return new Response('DEBUG: Failure getting user details', 200);  // TODO: determine how to handle this scenario
        }
    }

    // Any function with "And" in the name probably does two things, and that's true in this case
    // TODO: refactor into two functions, one to set the token and the other to calculate the redirect destination.
    public function setTokenAndCalculateRedirectDestination(UserModel $userModel, Application $app): string
    {
        $roles = AuthUserProvider::getSiteRoles($userModel, $app['website']);
        $oauthUser = new UserWithId($userModel->username, '', $userModel->username, $roles);
        $oauthToken = new UsernamePasswordToken($oauthUser, '', 'site', $oauthUser->getRoles());
        $tokenStorage = $app['security.token_storage'];
        if (!is_null($tokenStorage) && $tokenStorage instanceof TokenStorageInterface) {
            $tokenStorage->setToken($oauthToken);
            // TODO: We'd like to use AuthenticationSuccessHandler to handle calculating a better redirect URL, but I don't
            // currently know how to get service instances from the app's DI container when we're inside a URL handler. - 2017-11 RM
            $redirectUrl = '/';
            return $redirectUrl;
        } else {
            // OAuth authentication succeeded, but we failed to set the Silex auth token.
            $app['session']->getFlashBag()->add('errorMessage', 'Sorry, we couldn\'t process the Google login data. This may be a temporary failure, so please try again. If the problem persists, try logging in with a username and password instead.');
            return '/auth/login';  // TODO: Get this URL from config (where?) instead of hardcoding it
        }

    }
}
