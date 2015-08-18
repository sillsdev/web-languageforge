<?php

namespace Site\Handler;

use Api\Library\Shared\Website;
use Api\Model\ProjectModel;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;
use Symfony\Component\Security\Http\HttpUtils;

class AuthenticationSuccessHandler extends DefaultAuthenticationSuccessHandler
{
    public function __construct(HttpUtils $httpUtils, array $options, Session $session) {
        parent::__construct($httpUtils, $options);
        $this->session = $session;
    }

    /**
     * @var Session
     */
    protected $session = null;

    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        $username = $token->getUser()->getUsername();
        $user = new UserModel();
        if (! $user->readByUserName($username)) {
            return $this->httpUtils->createRedirectResponse($request, '/app/logout');
        }

        $this->session->set('user_id', $user->id->asString());
        $this->session->set('user', array('username' => $username));

        // Validate user is admin or has a role on the site.  Otherwise, redirect to logout
        $website = Website::get();
        if (($user->role == SystemRoles::SYSTEM_ADMIN) ||
            ($user->siteRole->offsetExists($website->domain) &&
                ($user->siteRole[$website->domain] != SiteRoles::NONE))) {
            // set the project context to user's default project
            $projectId = $user->getDefaultProjectId($website->domain);

            if ($projectId) {
                $this->session->set('projectId', $projectId);
            }

            $referer = $this->determineTargetUrl($request);
            if ($referer && strpos($referer, '/app') !== false) {
                return $this->httpUtils->createRedirectResponse($request, $referer);
            } elseif ($projectId) {
                $project = ProjectModel::getById($projectId);
                $url = '/app/'.$project->appName.'/'.$projectId;

                return $this->httpUtils->createRedirectResponse($request, $url);
            } else {
                return $this->httpUtils->createRedirectResponse($request, '/');
            }
        } else {
            $this->session->getFlashBag()->add('message', 'You are not authorized to use this site');

            return $this->httpUtils->createRedirectResponse($request, '/app/logout');
        }
    }
}
