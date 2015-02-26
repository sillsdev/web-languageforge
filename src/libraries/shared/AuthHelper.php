<?php

namespace libraries\shared;

use models\shared\rights\SiteRoles;
use models\shared\rights\SystemRoles;
use models\ProjectModel;
use models\UserModel;

class AuthHelper
{
    // return status
    const LOGIN_FAIL = 'loginFail';
    const LOGIN_FAIL_USER_UNAUTHORIZED = 'loginFailUserUnauthorized';
    const LOGIN_SUCCESS = 'loginSuccess';

    private $_ion_auth;

    private $_session;

    public function __construct($ion_auth, $session)
    {
        $this->_ion_auth = $ion_auth;
        $this->_session = $session;
    }

    /**
     *
     * @param string $identity
     * @param string $password
     * @param Website $website
     * @param bool $remember
     */
    public function login($website, $identity, $password, $remember = false)
    {
        if ($this->_ion_auth->login($identity, $password, $remember)) {

            // successful login
            $this->_session->set_flashdata('message', $this->_ion_auth->messages());

            $user = new UserModel((string) $this->_session->userdata('user_id'));

            // Validate user is admin or has a role on the site.  Otherwise, redirect to logout
            if (($user->role == SystemRoles::SYSTEM_ADMIN) ||
                    ($user->siteRole->offsetExists($website->domain) &&
                    ($user->siteRole[$website->domain] != SiteRoles::NONE))) {
                // set the project context to user's default project
                $projectId = $user->getDefaultProjectId($website->domain);

                if ($projectId) {
                    $this->_session->set_userdata('projectId', $projectId);
                }

                $referer = $this->_session->userdata('referer_url');
                if ($referer && strpos($referer, "/app") !== false) {
                    $this->_session->unset_userdata('referer_url');

                    return static::result(self::LOGIN_SUCCESS, $referer, 'location');
                } elseif ($projectId) {
                    $project = ProjectModel::getById($projectId);
                    $url = "/app/" . $project->appName . "/$projectId";

                    return static::result(self::LOGIN_SUCCESS, $website->baseUrl() . $url, 'location');
                } else {
                    return static::result(self::LOGIN_SUCCESS, $website->baseUrl() . '/', 'location');
                }
            } else {
                //log out with error msg
                $logout = $this->_ion_auth->logout();
                $this->_session->set_flashdata('message', 'You are not authorized to use this site');

                return static::result(self::LOGIN_FAIL_USER_UNAUTHORIZED, '/auth/login', 'refresh');
            }
        } else {
            //if the login was un-successful
            //redirect them back to the login page
            $this->_session->set_flashdata('message', $this->_ion_auth->errors());

            return static::result(self::LOGIN_FAIL, '/auth/login', 'refresh');
        }
    }

    public function logout()
    {
        $this->_ion_auth->logout();
    }

    /**
     * @param string $status
     * @param string $uri
     * @param string $method
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
