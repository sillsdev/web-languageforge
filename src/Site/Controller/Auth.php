<?php

namespace Site\Controller;

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\ProjectModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Core\Security;

defined('ENVIRONMENT') or exit('No direct script access allowed');

class Auth extends PublicApp
{
    // return status
    const LOGIN_FAIL = 'loginFail';
    const LOGIN_FAIL_USER_UNAUTHORIZED = 'loginFailUserUnauthorized';
    const LOGIN_SUCCESS = 'loginSuccess';

    public function view(Request $request, Application $app, $appName) {
        if ('login' === $appName) {
            $this->setupNgView($app, $appName);
            $this->data['error'] = $app['security.last_error']($request);
            $this->data['last_username'] = $app['session']->get(Security::LAST_USERNAME);
            $this->data['alertMessage'] = '';
            if ($app['session']->get('isFromLogout')) {
                $this->data['alertMessage'] = 'Logged Out Successfully';
            }

            return $this->renderPage($app, 'angular-app');
        } else {
            return $this->renderPage($app, $appName);
        }
    }

    /**
     * Taken from http://stackoverflow.com/questions/5886713/automatic-post-registration-user-authentication
     * @param Application $app
     * @param string $username
     * @param string $password
     */
    public static function login(Application $app, $username, $password) {
        $subRequest = Request::create(
            '/app/login_check', 'POST',
            array('_username' => $username, '_password' => $password),
            $app['request']->cookies->all(), array(), $app['request']->server->all()
        );
        $app->handle($subRequest, HttpKernelInterface::MASTER_REQUEST, false);
    }

    /**
     * @param string $status
     * @param string $uri
     * @param string $method
     * @return array
     */
    public static function result($status, $uri, $method = 'location') {
        return array(
            'status' => $status,
            'redirect' => array(
                'url' => $uri,
                'method' => $method
            )
        );
    }
}
