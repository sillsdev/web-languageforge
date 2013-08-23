<?php

use models\rights\Operation;
use models\rights\Domain;
use models\rights\Realm;
use models\rights\Roles;

class Base extends CI_Controller {
	
	protected $_isLoggedIn;
	
	protected $_user;
	
	public function __construct() {
		parent::__construct();
		$this->load->library('ion_auth');
		$this->_isLoggedIn = $this->ion_auth->logged_in();
		if ($this->_isLoggedIn) {
			try {
				$userId = (string)$this->session->userdata('user_id');
				$this->_user = new \models\UserModel($userId);
			} catch (Exception $e) {
				error_log("User not found, logged out.\n" . $e->getMessage());
				$this->ion_auth->logout();
			}
		}
	}
	
	// all child classes should use this method to render their pages
	protected function _render_page($view, $data=null, $render=true)
	{
		$this->viewdata = (empty($data)) ? $this->data: $data;
		
		if (file_exists(APPPATH . "/views/" . $view . ".html.php")) {
			$view = $view . ".html.php";
		}
		
		$this->viewdata["page"] = $view;
		$this->viewdata['is_admin'] = false;
		
		// setup specific variables for header
		$this->viewdata['logged_in'] = $this->_isLoggedIn;
		if ($this->_isLoggedIn) {
			$isAdmin = Roles::hasRight(Realm::SITE, $this->_user->role, Domain::USERS + Operation::CREATE);
			$this->viewdata['is_admin'] = $isAdmin;
			$this->viewdata['user_name'] = $this->_user->username;
			$this->viewdata['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
			$this->viewdata['small_avatar_url'] = $this->_user->avatar_ref;
			$projects = $this->_user->listProjects();
			$this->viewdata['projects_count'] = $projects->count;
			$this->viewdata['projects'] = $projects->entries;
			if ($isAdmin) {
				$projectList = new models\ProjectListModel();
				$projectList->read();
				$this->viewdata['all_projects_count'] = $projectList->count;
				$this->viewdata['all_projects'] = $projectList->entries;
			}
		}
		$view_html = $this->load->view('templates/container.html.php', $this->viewdata, !$render);

		if (!$render) return $view_html;
	}
	
}