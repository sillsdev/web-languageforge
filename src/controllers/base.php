<?php


use models\ProjectListModel;
use models\FeaturedProjectListModel;

use models\rights\Operation;
use models\rights\Domain;
use models\rights\Realm;
use models\rights\Roles;


class Base extends CI_Controller {
	
	protected $_isLoggedIn;
	
	protected $_user;
	
	protected $_project;
	
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
		$uriParts = explode('.', $_SERVER['HTTP_HOST']);
		if ($uriParts[0] == 'www') {
			array_shift($uriParts);
		}
		if ($uriParts[0] == 'scriptureforge' || $uriParts[0] == 'dev') {
			$this->_project = 'scriptureforge';
		} else {
			$this->_project = $uriParts[0];
		}
		
	}
	
	// all child classes should use this method to render their pages
	protected function _render_page($view, $data=null, $render=true) {
		$this->renderProjectPage($view, '', $data, $render);
	}
	
	protected function renderProjectPage($view, $project = '', $data = null, $render = true) {
		$this->viewdata = (empty($data)) ? $this->data : $data;

		$project = $this->_project;
		
		if ($project == 'scriptureforge') {
			$containerView = 'templates/container.html.php';
		} else {
// 			$view = 'projects/' . $project . '/' . $view;
			$containerView = 'projects/' . $project . '/templates/container.html.php';
		}
		
		if (file_exists(self::templateToPath($view))) {
			$this->viewdata["page"] = $view . ".html.php";
		} else if (file_exists(self::templateToPath($view, '.php'))) {
			$this->viewdata["page"] = $view . ".php";
		}
		
		$this->viewdata['is_admin'] = false;
		
		// setup specific variables for header
		$this->viewdata['logged_in'] = $this->_isLoggedIn;
		
		$featuredProjectList = new FeaturedProjectListModel();
		$featuredProjectList->read();
		$this->viewdata['featuredProjects'] = $featuredProjectList->entries;
		
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
		$view_html = $this->load->view($containerView, $this->viewdata, !$render);
		
		if (!$render) return $view_html;
	}
	
	/**
	 * @param string $templateName
	 * @return string
	 */
	protected static function templateToPath($templateName, $suffix = '.html.php') {
		return 'views/' .  $templateName . $suffix;
	}
	
}