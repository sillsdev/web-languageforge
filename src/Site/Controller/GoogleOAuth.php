<?php

namespace Site\Controller;

use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Google;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Site\Model\UserWithId;
use Site\Provider\AuthUserProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
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
        $website = Website::get();
        $redirectUri = $website->baseUrl() . '/oauthcallback/'. $this->getProviderName();
        $provider = new SelectAccountOAuthProvider([
            'clientId'     => GOOGLE_CLIENT_ID,
            'clientSecret' => GOOGLE_CLIENT_SECRET,
            'redirectUri'  => $redirectUri,
        ]);

        $error = $request->query->get('error', null);
        if (! is_null($error)) {
            if ($error === 'immediate_failed') {
                // Not a problem; this just means that the user wasn't logged in elsewhere.
                return $this->getAuthCode($app, $provider, ["prompt" => "select_account"]);
            }
            $this->addErrorMessage($app, 'OAuth error ' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8'));
            return new RedirectResponse($this->chooseRedirectUrl(false, $app));
        }
        if ($app['session']->has('oauthtoken')) {
            $token = $app['session']->get('oauthtoken');
        } else {
            $code = $request->query->get('code', null);
            if (is_null($code)) {
                return $this->getAuthCode($app, $provider, ["prompt" => "select_account"]);
            } else {
                $state = $request->query->get('state', null);
                if (is_null($state) || ($state !== $app['session']->get('oauth2state'))) {
                    // Invalid state, which *could* indicate some kind of attempted hack (CSRF, etc.)
                    $app['session']->remove('oauth2state');
                    // Don't display an error message for this one, just go back to the login page
                    return new RedirectResponse($this->chooseRedirectUrl(false, $app));
                    // Or just try to get an auth code again:
                    // return $this->getAuthCode($app, $provider, ["prompt" => "select_account"]);
                }
                if ($app['session']->has('oauthtoken')) {
                    $token = $app['session']->get('oauthtoken');
                } else {
                    $token = $provider->getAccessToken('authorization_code', [
                        'code' => $code
                    ]);
                    $app['session']->set('oauthtoken', $token);
                    $app['session']->set('oauthprovider', $this->getProviderName());
                }
            }
        }
        return $this->loginWithOAuthToken($app, $provider, $token);
    }

    public function addSessionMessage(Application $app, string $message, string $priority)
    {
        $app['session']->getFlashBag()->add($priority, $message);
    }

    public function addInfoMessage(Application $app, string $message)
    {
        $this->addSessionMessage($app, $message, 'infoMessage');
    }

    public function addErrorMessage(Application $app, string $message)
    {
        $this->addSessionMessage($app, $message, 'errorMessage');
    }

    public function getProviderName(): string
    {
        return "google";
    }

    public static function createOAuthProvider(string $providerName)
    {
        // Factory
        switch ($providerName) {
            case "google":
                return new GoogleOAuth();
                break;
            case "facebook":
                break;
            case "paratext":
                break;
            default:
                break;
        }
        return new GoogleOAuth();
    }

    /**
     * @param UserModel $user
     * @param string $oauthTokenId
     *
     * Override this to set the appropriate property in the user model.
     * Do not call write() in this function; that's the job of the calling code.
     */
    public function addOAuthIdToUserModel(UserModel $user, string $oauthTokenId)
    {
        $user->googleOAuthIds[] = $oauthTokenId;
    }

    public function linkOAuthAccount(SessionInterface $session, UserModel $user)
    {
        $oauthTokenId = $session->get(GoogleOAuth::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
        if (!is_null($oauthTokenId)) {
            $oauthProvider = $session->get(GoogleOAuth::SESSION_KEY_OAUTH_PROVIDER);
            $provider = GoogleOAuth::createOAuthProvider($oauthProvider);
            $provider->addOAuthIdToUserModel($user, $oauthTokenId);
            GoogleOAuth::removeOAuthKeysFromSession($session);
        }
    }

    public function findUserModelByOAuthId(string $oauthId)
    {
        $userModel = new UserModel();
        $userModel->readByPropertyArrayContains($this->getProviderName() . 'OAuthIds', $oauthId);
        return $userModel;
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
            $this->addErrorMessage($app, 'Sorry, we couldn\'t process the ' . ucwords($this->getProviderName()) . ' login data. This may be a temporary failure, so please try again. If the problem persists, try logging in with a username and password instead.');
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

    /**
     * @param Application $app
     * @param AbstractProvider $provider
     * @return RedirectResponse
     */
    protected function getAuthCode(Application $app, AbstractProvider $provider, array $options): RedirectResponse
    {
        $authUrl = $provider->getAuthorizationUrl($options);
        $app['session']->set('oauth2state', $provider->getState());
        return new RedirectResponse($authUrl);
    }

    public static function removeOAuthKeysFromSession(SessionInterface $session) {
        $session->remove(GoogleOAuth::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
        $session->remove(GoogleOAuth::SESSION_KEY_OAUTH_PROVIDER);
        $session->remove(GoogleOAuth::SESSION_KEY_OAUTH_EMAIL_ADDRESS);
        $session->remove(GoogleOAuth::SESSION_KEY_OAUTH_FULL_NAME);
    }

    /**
     * @param Application $app
     * @param AbstractProvider $provider
     * @param $token
     * @return RedirectResponse|Response
     */
    protected function loginWithOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        try {
            $userDetails = $provider->getResourceOwner($token);

            // Look up UserModel with incoming oauthId
            $googleOAuthId = $userDetails->getId();
            $userModel = $this->findUserModelByOAuthId($googleOAuthId);
            if (!$userModel->id->asString()) {
                // No user has this OAuth ID
                $userModel->readByEmail($userDetails->getEmail());
                if (!$userModel->id->asString()) {
                    // And no match by email either

                    // Pass all OAuth information into the "what next?" page via the session, so that the user doesn't see it in the login page URL
                    $this->setOAuthDetailsInSession($app, $googleOAuthId, $userDetails->getEmail(), $userDetails->getName());

                    // We'll ask the user to either link existing account or create a new account
                    return new RedirectResponse('/auth/link_oauth_account');
                } else {
                    // Found an email address matching this OAuth token, so add the token
                    $this->addOAuthIdToUserModel($userModel, $googleOAuthId);
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

    /**
     * @param Application $app
     * @param string $googleOAuthId
     * @param string $email
     */
    protected function setOAuthDetailsInSession(Application $app, string $googleOAuthId, string $email, string $fullName)
    {
        $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK, $googleOAuthId);
        $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_PROVIDER, 'google');
        $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_EMAIL_ADDRESS, $email);
        $app['session']->set(GoogleOAuth::SESSION_KEY_OAUTH_FULL_NAME, $fullName);
    }
}
