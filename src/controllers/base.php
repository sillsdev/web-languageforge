<?php

class Base extends CI_Controller {
	
	public function __construct() {
		parent::__construct();
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
		$isLoggedIn = $this->ion_auth->logged_in();
		$this->viewdata['logged_in'] = $isLoggedIn;
		if ($isLoggedIn) {
			$userId = (string)$this->session->userdata('user_id');
			$user = new \models\UserModel($userId);
			$isAdmin = $this->ion_auth->is_admin();
			$this->viewdata['is_admin'] = $isAdmin;
			$this->viewdata['user_name'] = $user->name;
			$this->viewdata['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
			$projects = $user->listProjects();
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