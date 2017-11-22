<?php

namespace Site\Handler;

use Api\Library\Shared\Website;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Site\OAuth\OAuthBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;
use Symfony\Component\Security\Http\HttpUtils;

class AuthenticationSuccessHandler extends DefaultAuthenticationSuccessHandler
{
    /**
     * Constructor.
     * @param HttpUtils $httpUtils
     * @param array     $options   Options for processing a successful authentication attempt.
     * @param string|null $providerKey
     */
    public function __construct(HttpUtils $httpUtils, array $options = array(), $providerKey = null) {
        parent::__construct($httpUtils, $options);
        $this->setProviderKey($providerKey);
    }

    /**
     * Used to detect if we are signing in after OAuth success in order to link accounts
     * @param SessionInterface $session
     * @return mixed
     */
    public function hasOAuthId(SessionInterface $session)  // TODO: Move to the OAuthProvider base class, along with the next two functions
    {
        return (!is_null($session)) && $session->has('oauthTokenIdToLink');
    }

    /**
     * @param UserModel $user
     * @param string $oauthTokenId
     * @param string $oauthProvider
     */
    public function addOAuthIdToUserModelForAnyProvider(UserModel $user, string $oauthTokenId, string $oauthProvider)
    {
        switch ($oauthProvider) {
            case "google":
                $user->googleOAuthIds[] = $oauthTokenId;
                break;
            case "facebook":
                $user->facebookOAuthIds[] = $oauthTokenId;
                break;
            case "paratext":
                $user->paratextOAuthIds[] = $oauthTokenId;
                break;
            default:
                break;  // Do nothing
        }
    }

    public function addOAuthIdToUserModel(SessionInterface $session, UserModel $user)
    {
        $oauthTokenId = $session->get(OAuthBase::SESSION_KEY_OAUTH_TOKEN_ID_TO_LINK);
        if (!is_null($oauthTokenId)) {
            $oauthProvider = $session->get(OAuthBase::SESSION_KEY_OAUTH_PROVIDER);
            $this->addOAuthIdToUserModelForAnyProvider($user, $oauthTokenId, $oauthProvider);
            OAuthBase::removeOAuthKeysFromSession($session);
        }
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        $username = $token->getUser()->getUsername();
        $user = new UserModel();
        if (strpos($username, '@') !== false) {
            $user->readByEmail($username);
        } else {
            $user->readByUserName($username);
        }
        $website = Website::get();

        $session = $request->getSession();
        if ($this->hasOAuthId($session)) {
            // NOTE that this adds the OAuth ID to the user model without checking if it's already there. That check
            // should happen elsewhere, and an oauthTokenIdToLink should only be put in the session if it's necessary.
            $this->addOAuthIdToUserModel($session, $user);
        }

        $user->last_login = time();
        $user->write();

        $projectId = $user->getCurrentProjectId($website->domain);

        // redirect to page before the login screen was presented, or to the default project for this user
        $referer = $this->determineTargetUrl($request);
        $url = '/app/projects';
        if ($referer and strpos($referer, '/app/') !== false) {
            $url = $referer;
        } elseif ($projectId && ProjectModel::projectExistsOnWebsite($projectId, $website)) {
            $project = ProjectModel::getById($projectId);
            if ($project->userIsMember($user->id->asString())) {
                $url = '/app/'.$project->appName.'/'.$projectId;
            }
        }
        return $this->httpUtils->createRedirectResponse($request, $url);
    }
}
