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
    public function __construct(HttpUtils $httpUtils, array $options = [], $providerKey = null)
    {
        parent::__construct($httpUtils, $options);
        $this->setProviderKey($providerKey);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        $username = $token->getUser()->getUsername();
        $user = new UserModel();
        if (strpos($username, "@") !== false) {
            $user->readByEmail($username);
        } else {
            $user->readByUserName($username);
        }
        $website = Website::get();

        $session = $request->getSession();
        if (OAuthBase::sessionHasOAuthId($session)) {
            OAuthBase::linkOAuthAccount($session, $user);
            // NOTE that this adds the OAuth ID to the user model without checking if it's already there. That check
            // should happen elsewhere, and an oauthTokenIdToLink should only be put in the session if it's necessary.
        }

        $user->last_login = time();
        $user->write();

        $projectId = $user->getCurrentProjectId($website->domain);

        // redirect to page before the login screen was presented, or to the default project for this user
        $referer = $this->determineTargetUrl($request);
        $url = "/app/projects";
        if ($referer and strpos($referer, "/app/") !== false) {
            $url = $referer;
        } elseif ($projectId && ProjectModel::projectExistsOnWebsite($projectId, $website)) {
            $project = ProjectModel::getById($projectId);
            if ($project->userIsMember($user->id->asString())) {
                $url = "/app/" . $project->appName . "/" . $projectId;
            }
        }
        return $this->httpUtils->createRedirectResponse($request, $url);
    }
}
