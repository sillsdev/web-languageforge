<?php

namespace libraries\shared;

use libraries\shared\Website;
use models\shared\rights\SiteRoles;
use models\shared\rights\SystemRoles;
use models\ProjectModel;
use models\UserModel;
use models\languageforge\lexicon\Example;

class AuthHelper {
	
	// return results
	const LOGIN_FAIL = 'loginFail';
	const LOGIN_FAIL_USER_UNAUTHORIZED = 'loginFailUserUnauthorized';
	const LOGIN_SUCCESS = 'loginSuccess';
	
	private $_ion_auth;
	
	private $_session;
	
	public function __construct($ion_auth, $session) {
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
	public function login($website, $identity, $password, $remember = false) {
		if ($this->_ion_auth->login($identity, $password, $remember)) {
			
			// successful login
			$this->_session->set_flashdata('message', $this->_ion_auth->messages());
		
			$user = new UserModel((string)$this->_session->userdata('user_id'));
			
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
					static::redirect($website, $referer, 'location');
				} else if ($projectId) {
					$project = ProjectModel::getById($projectId);
					$url = "/app/" . $project->appName . "/$projectId";
					static::redirect($website, $url, 'location');
				} else {
					static::redirect($website, '/', 'location');
				}
				return self::LOGIN_SUCCESS;
			} else {
				//log out with error msg
				$logout = $this->_ion_auth->logout();
				$this->_session->set_flashdata('message', 'You are not authorized to use this site');
				static::redirect($website, '/auth/login', 'refresh'); //use redirects instead of loading views for compatibility with MY_Controller libraries
				return self::LOGIN_FAIL_USER_UNAUTHORIZED;
			}
		} else {
			//if the login was un-successful
			//redirect them back to the login page
			$this->_session->set_flashdata('message', $this->_ion_auth->errors());
			static::redirect($website, '/auth/login', 'refresh'); //use redirects instead of loading views for compatibility with MY_Controller libraries
			return self::LOGIN_FAIL;
		}
	}
	
	public function logout() {
		$this->_ion_auth->logout();
	}
	
	/**
	 * @param Website $website
	 * @param string $uri
	 * @param string $method
	 * @param number $http_response_code
	 */
	public static function redirect($website, $uri = '', $method = 'location', $http_response_code = 302) {
		if ( ! preg_match('#^https?://#i', $uri)) {
// 			$uri = site_url($uri);
			$uri = $website->baseUrl();
		}
	
		switch($method) {
			case 'refresh': 
				header("Refresh:0;url=".$uri);
				break;
			default: 
				header("Location: ".$uri, true, $http_response_code);
				break;
		}
// 		exit;
	}
	
}

?>
