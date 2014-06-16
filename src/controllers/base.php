<?php


use models\shared\rights\SiteRoles;

use libraries\shared\Website;

use models\ProjectListModel;
use models\FeaturedProjectListModel;

use models\shared\rights\Operation;
use models\shared\rights\Domain;
use models\ProjectModel;

require_once(APPPATH . "version.php");


class Base extends CI_Controller {
	
	protected $_isLoggedIn;
	
	protected $_user;
	protected $_userId;
	
	// this should probably be renamed to projectCode or something
	public $project;
	
	protected $_projectId;
	
	public $site;
	
	public function __construct() {
		parent::__construct();
		$protocol = Website::getProtocolForHostName();
		if ($protocol == 'https') {
			// Redirect to same page with HTTPS if we accessed it with HTTP
			if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ""){
				$redirect = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
				header("Location: $redirect");
			}
		}
		$this->load->library('ion_auth');
		$this->_isLoggedIn = $this->ion_auth->logged_in();
		if ($this->_isLoggedIn) {
			try {
				$userId = (string)$this->session->userdata('user_id');
				$this->_userId = $userId;
				$this->_user = new \models\UserModel($userId);
				$this->_projectId = (string)$controller->session->userdata('projectId');
			} catch (Exception $e) {
				error_log("User $userId not found, logged out.\n" . $e->getMessage());
				$this->ion_auth->logout();
			}
			// Check the role
			/* this is migration code... we don't need this here
			if (!$this->_user->role) {
				error_log("Fixing role for user " .  $this->_user->id->asString());
				$this->_user->role = SiteRoles::USER;
				$this->_user->write();
			}
			*/
		}
		$this->project = Website::getProjectThemeNameFromDomain($_SERVER['HTTP_HOST']);
		$this->site = Website::getSiteName();
	}
	
	// all child classes should use this method to render their pages
	protected function renderPage($view, $data=null, $render=true) {
		$this->renderProjectPage($view, '', $data, $render);
	}
	
	protected function renderProjectPage($view, $project = '', $data = array(), $render = true) {
		$this->viewdata = $data;
		$this->viewdata['contentTemplate'] = $this->getContentTemplatePath($view);
		$this->viewdata['projectPath'] = $this->getProjectPath();
		$this->viewdata['defaultProjectPath'] = $this->getProjectPath('default');
		
		$this->populateHeaderMenuViewdata();
		
		$containerTemplatePath = $this->getSharedTemplatePath("container");
		return $this->load->view($containerTemplatePath, $this->viewdata, !$render);
	}
	
	protected function populateHeaderMenuViewdata() {
		$this->viewdata['is_admin'] = false;
		
		// setup specific variables for header
		$this->viewdata['logged_in'] = $this->_isLoggedIn;
		
		$featuredProjectList = new FeaturedProjectListModel();
		$featuredProjectList->read();
		$this->viewdata['featuredProjects'] = $featuredProjectList->entries;
		
		if ($this->_isLoggedIn) {
			$isAdmin = SiteRoles::hasRight($this->_user->role, Domain::USERS + Operation::CREATE);
			$this->viewdata['is_admin'] = $isAdmin;
			$this->viewdata['user_name'] = $this->_user->username;
			$this->viewdata['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
			$this->viewdata['small_avatar_url'] = $this->_user->avatar_ref;
			$projects = $this->_user->listProjects($this->site);
			$this->viewdata['projects_count'] = $projects->count;
			$this->viewdata['projects'] = $projects->entries;
			$this->viewdata['hostname'] = Website::getHostName();
		}
	}
	
	protected function getSharedTemplatePath($templateName) {
		$viewPath = "shared/$templateName.html.php";
		if (file_exists("views/$viewPath")) {
			return $viewPath;
		}
		return '';
	}
	
	protected function getProjectPath($project = "") {
		if (!$project) {
			$project = $this->project;
		}
		return $this->site . "/" . $project;
	}
	
	protected function getContentTemplatePath($templateName) {
		$sharedPath = $this->getSharedTemplatePath($templateName);
		if ($sharedPath != '') {
			return $sharedPath;
		} else {
			return $this->getProjectTemplatePath($templateName);
		}
	}
	
	protected function getProjectTemplatePath($templateName, $project = "") {
		$viewPath = $this->getProjectPath() . "/$templateName.html.php";
		if (file_exists("views/$viewPath")) {
			return $viewPath;
		} else {
			$viewPath = $this->getProjectPath('default') . "/$templateName.html.php";
			if (file_exists("views/$viewPath")) {
				return $viewPath;
			}
		}
		return '';
	}
	
	
	
	
}