<?php

namespace Site\Controller;

use Api\Library\Shared\Communicate\Communicate;
use Api\Model\Command\UserCommands;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;
use Api\Model\UserModelBase;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\SecurityContextInterface;

defined('ENVIRONMENT') or exit('No direct script access allowed');

class Auth extends PublicApp
{
    // return status
    const LOGIN_FAIL = 'loginFail';
    const LOGIN_FAIL_USER_UNAUTHORIZED = 'loginFailUserUnauthorized';
    const LOGIN_SUCCESS = 'loginSuccess';

    public function view(Request $request, Application $app, $appName, $resetPasswordKey = '')
    {
        switch ($appName) {
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'reset_password':
                $user = new UserModelBase();
                if (!$user->readByProperty('resetPasswordKey', $resetPasswordKey)) {
                    $app['session']->getFlashBag()->add('errorMessage', 'Your password reset cannot be completed. Please try again.');

                    return $app->redirect('/auth/login');
                }

                if (!$user->hasForgottenPassword(false)) {
                    $app['session']->getFlashBag()->add('errorMessage', 'Your password reset cannot be completed. It may have expired. Please try again.');

                    return $app->redirect('/auth/login');
                }

                // no break; - intentional fall through to next case
            case 'forgot_password':
            case 'login':
                $this->setupNgView($app, $appName);
                $this->setupAuthView($request, $app);

                return $this->renderPage($app, 'angular-app');
                break;
            default:
                return $this->renderPage($app, $appName);
        }
    }

    public function forgotPassword(Request $request, Application $app)
    {
        $username = $request->request->get('_username');
        $identityCheck = UserCommands::checkIdentity($username, '', $this->website);
        if (! $identityCheck->usernameExists) {
            $app['session']->getFlashBag()->add('errorMessage', 'User not found.');

            return $this->view($request, $app, 'forgot_password');
        }

        $user = new UserModel();
        $user->readByUserName($username);

        if (! $identityCheck->usernameExistsOnThisSite and $user->role != SystemRoles::SYSTEM_ADMIN) {
            $app['session']->getFlashBag()->add('errorMessage', sprintf('Username "%s" not available on "%s". Use "Create an Account".', $username, $this->website->domain));

            return $this->view($request, $app, 'forgot_password');
        }

        Communicate::sendForgotPasswordVerification($user, $this->website);

        $app['session']->getFlashBag()->add('infoMessage', 'Password Reset email sent for username "'.$username.'"');

        return $app->redirect('/auth/login');
    }

    /**
     * @param Request $request
     * @param Application $app
     */
    private function setupAuthView(Request $request, Application $app)
    {
        $this->data['last_username'] = $app['session']->get(Security::LAST_USERNAME);
        if ($app['security.last_error']($request)) {
            $app['session']->getFlashBag()->add('errorMessage', $app['security.last_error']($request));
            if ($app['session']->has(SecurityContextInterface::AUTHENTICATION_ERROR)) {
                $app['session']->remove(SecurityContextInterface::AUTHENTICATION_ERROR);
            }
        }
    }

    /**
     * @param Application $app
     * @param string $resetPasswordKey
     * @param string $newPassword
     * @throws \Api\Library\Shared\Palaso\Exception\UserUnauthorizedException
     * @return string $userId
     */
    public static function resetPassword(Application $app, $resetPasswordKey = '', $newPassword = '')
    {
        $user = new UserModelBase();
        if (!$user->readByProperty('resetPasswordKey', $resetPasswordKey)) {
            $app['session']->getFlashBag()->add('errorMessage', 'Your password reset cannot be completed. Please try again.');
            return false;
        }

        if (!$user->hasForgottenPassword()) {
            $app['session']->getFlashBag()->add('errorMessage', 'Your password reset cannot be completed. It may have expired. Please try again.');
            return false;
        }

        $userId = $user->id->asString();
        UserCommands::changePassword($userId, $newPassword, $userId);
        $app['session']->getFlashBag()->add('infoMessage', 'Your password has been reset. Please login.');
        return $user->write();
    }

    /**
     * Taken from http://stackoverflow.com/questions/5886713/automatic-post-registration-user-authentication
     * @param Application $app
     * @param string $username
     * @param string $password
     */
    public static function login(Application $app, $username, $password)
    {
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
    public static function result($status, $uri, $method = 'location')
    {
        return array(
            'status' => $status,
            'redirect' => array(
                'url' => $uri,
                'method' => $method
            )
        );
    }
}
