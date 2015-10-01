<?php

namespace Site\Handler;

use Api\Library\Shared\Website;
use Api\Model\ProjectModel;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;

class AuthenticationSuccessHandler extends DefaultAuthenticationSuccessHandler
{
    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        $username = $token->getUser()->getUsername();
        $user = new UserModel();
        if (! $user->readByUserName($username)) {
            return $this->httpUtils->createRedirectResponse($request, '/app/logout');
        }

        $request->getSession()->set('user_id', $user->id->asString());
        $request->getSession()->set('user', array('username' => $username));

        $website = Website::get();
        if (($user->role != SystemRoles::SYSTEM_ADMIN) and
            !($user->siteRole->offsetExists($website->domain) and
                ($user->siteRole[$website->domain] != SiteRoles::NONE))) {
            return $this->httpUtils->createRedirectResponse($request, '/app/logout');
        }

        $projectId = $user->getDefaultProjectId($website->domain);
        if ($projectId) {
            $request->getSession()->set('projectId', $projectId);
        }

        $referer = $this->determineTargetUrl($request);
        if ($referer and strpos($referer, '/app/') !== false) {
            return $this->httpUtils->createRedirectResponse($request, $referer);
        } elseif ($projectId) {
            $project = ProjectModel::getById($projectId);
            $url = '/app/'.$project->appName.'/'.$projectId;

            return $this->httpUtils->createRedirectResponse($request, $url);
        } else {
            return $this->httpUtils->createRedirectResponse($request, '/');
        }
    }
}
