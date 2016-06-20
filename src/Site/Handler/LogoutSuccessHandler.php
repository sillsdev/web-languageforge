<?php

namespace Site\Handler;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Component\Security\Http\Logout\DefaultLogoutSuccessHandler;

class LogoutSuccessHandler extends DefaultLogoutSuccessHandler
{
    public function __construct(HttpUtils $httpUtils, $targetUrl = '/', Session $session) {
        parent::__construct($httpUtils, $targetUrl);
        $this->session = $session;
    }

    protected $session = null;

    public function onLogoutSuccess(Request $request) {
        $this->session->getFlashBag()->add('infoMessage', 'Logged Out Successfully');

        return $this->httpUtils->createRedirectResponse($request, '/auth/login');
    }
}
