<?php

namespace Site\OAuth;

use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use Silex\Application;
use Site\Controller\Base;
use Site\Controller\Exception;
use Site\Model\UserWithId;
use Site\Provider\AuthUserProvider;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

abstract class OAuthBase extends Base
{
    const SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK = 'oauthTokenIdToLink';
    const SESSION_KEY_OAUTH_PROVIDER = 'oauthProvider';
    const SESSION_KEY_OAUTH_EMAIL_ADDRESS = 'oauthEmailAddress';
    const SESSION_KEY_OAUTH_FULL_NAME = 'oauthFullName';
    const SESSION_KEY_OAUTH_AVATAR_URL = 'oauthAvatarUrl';
    const SESSION_KEY_OAUTH_ACCESS_TOKEN = 'oauthToken';

    /**
     * @param $redirectUri
     * @return AbstractProvider
     */
    abstract protected function getOAuthProvider($redirectUri): AbstractProvider;

    public function oauthCallback(Request $request, Application $app)
    {
        $website = Website::get();
        $redirectUri = $website->baseUrl() . '/oauthcallback/'. $this->getProviderName();
        $provider = $this->getOAuthProvider($redirectUri);

        $error = $request->query->get('error', null);
        if (! is_null($error)) {
            if ($error === 'immediate_failed') {
                // Not a problem; this just means that the user wasn't logged in elsewhere.
                return $this->getAuthCode($app, $provider, ["prompt" => "select_account"]);
            }
            $this->addErrorMessage($app, 'OAuth error ' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8'));
            return new RedirectResponse($this->chooseRedirectUrl(false, $app));
        }
        if ($app['session']->has(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN)
            && $app['session']->has(OauthBase::SESSION_KEY_OAUTH_PROVIDER)
            && $app['session']->get(OauthBase::SESSION_KEY_OAUTH_PROVIDER) == $this->getProviderName()) {
            $token = $app['session']->get(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN);
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
                if ($app['session']->has(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN) && $app['session']->has(OauthBase::SESSION_KEY_OAUTH_PROVIDER) && $app['session']->get(OauthBase::SESSION_KEY_OAUTH_PROVIDER) == $this->getProviderName()) {
                    $token = $app['session']->get(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN);
                } else {
                    $token = $provider->getAccessToken('authorization_code', [
                        'code' => $code
                    ]);
                    $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN, $token);
                    $app['session']->set(OauthBase::SESSION_KEY_OAUTH_PROVIDER, $this->getProviderName());
                }
            }
        }
        return $this->handleOAuthToken($app, $provider, $token);
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

    abstract public function getProviderName(): string;

    public static function createOAuthProvider(string $providerName)
    {
        // TODO: This factory function should probably get its own class
        switch ($providerName) {
            case "google":
                return new GoogleOAuth();
                break;
            case "facebook":
                // TODO: Implement FacebookOAuth class
                break;
            case "paratext":
                return new ParatextOAuth();
                break;
            default:
                break;
        }
        throw new \InvalidArgumentException("Unknown OAuth provider name");
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

    public static function linkOAuthAccount(SessionInterface $session, UserModel $user)
    {
        $oauthTokenId = $session->get(OAuthBase::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
        if (!is_null($oauthTokenId)) {
            $oauthProvider = $session->get(OAuthBase::SESSION_KEY_OAUTH_PROVIDER);
            $provider = OAuthBase::createOAuthProvider($oauthProvider);
            $provider->addOAuthIdToUserModel($user, $oauthTokenId);
            OAuthBase::removeOAuthKeysFromSession($session);
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

    /**
     * Used to detect if we are signing in after OAuth success in order to link accounts
     * @param SessionInterface $session
     * @return mixed
     */
    public static function sessionHasOAuthId(SessionInterface $session)
    {
        return (!is_null($session)) && $session->has(OAuthBase::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
    }

    public static function removeOAuthKeysFromSession(SessionInterface $session) {
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_ACCESS_TOKEN);
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_PROVIDER);
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_EMAIL_ADDRESS);
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_FULL_NAME);
        $session->remove(OAuthBase::SESSION_KEY_OAUTH_AVATAR_URL);
    }

    abstract protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token);

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
                    $avatar = $userDetails->getAvatar();
                    if (!is_null($avatar)) {
                        $avatar = $this->getFullSizeAvatarUrl($avatar);
                    }
                    $this->setOAuthDetailsInSession($app, $googleOAuthId, $userDetails->getEmail(), $userDetails->getName(), $avatar);

                    // We'll ask the user to either link existing account or create a new account
                    return new RedirectResponse('/auth/oauth-signup');
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
     * Override in descendant classes if avatar URLs have size embedded in them (e.g., for Google, we would strip the '?sz=50' from the URL)
     * @param string $avatarUrl
     * @return string
     */
    public function getFullSizeAvatarUrl(string $avatarUrl)
    {
        return $avatarUrl;
    }

    /**
     * @param Application $app
     * @param string $googleOAuthId
     * @param string $email
     */
    protected function setOAuthDetailsInSession(Application $app, string $googleOAuthId, string $email, string $fullName, string $avatarUrl = null)
    {
        $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK, $googleOAuthId);
        $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_PROVIDER, 'google');
        $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_EMAIL_ADDRESS, $email);
        $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_FULL_NAME, $fullName);
        if ($avatarUrl) {
            $app['session']->set(OAuthBase::SESSION_KEY_OAUTH_AVATAR_URL, $avatarUrl);
        }
    }
}
