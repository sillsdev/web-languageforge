<?php

namespace libraries\shared;

class AuthHelper {

	private $_auth;
	
	private $_session;
	
	public function __construct($ionAuth, $session) {
		$this->_auth = $ionAuth;
		$this->_session = $session;
	}
	
	public function login($identity, $password, $remember = false) {
		if ($this->_auth->login($identity, $password, $remember)) {
			
			// successful login
			$this->_session->set_flashdata('message', $this->_auth->messages());
		
			$website = Website::get();
			$user = new \models\UserModel((string)$this->_session->userdata('user_id'));
		
			// Validate user is admin or has a role on the site.  Otherwise, redirect to logout
			if ( ($user->role == SystemRoles::SYSTEM_ADMIN) ||
			($user->siteRole->offsetExists($website->domain) &&
					($user->siteRole[$website->domain] != SiteRoles::NONE)) ) {
				// set the project context to user's default project
				$projectId = $user->getDefaultProjectId($website->domain);
					
				if ($projectId) {
					$this->_session->set_userdata('projectId', $projectId);
				}
					
				$referer = $this->_session->userdata('referer_url');
				if ($referer && strpos($referer, "/app") !== false) {
					$this->_session->unset_userdata('referer_url');
					redirect($referer, 'location');
				} else if ($projectId) {
					$project = ProjectModel::getById($projectId);
					$url = "/app/" . $project->appName . "/$projectId";
					redirect($url, 'location');
				} else {
					redirect('/', 'location');
				}
			} else {
				//log out with error msg
				// TODO: refactor this to handle cross-site logins
				$logout = $this->_auth->logout();
				$this->_session->set_flashdata('message', 'You are not authorized to use this site');
				redirect('/auth/login', 'refresh'); //use redirects instead of loading views for compatibility with MY_Controller libraries
			}
		} else {
			//if the login was un-successful
			//redirect them back to the login page
			$this->_session->set_flashdata('message', $this->_auth->errors());
			redirect('/auth/login', 'refresh'); //use redirects instead of loading views for compatibility with MY_Controller libraries
		}
		
	}
	
	public function logout() {
		$this->_auth->logout();
	}
	
}

?>
