<?php 

require_once 'base.php';

// This controller is used to display a projects page or pages
// the "featured projects" drop down links to this controller
class Projects extends Base {
	
	public function view($project = 'default') {
		$data = array();
		$data['title'] = $this->site;
		$data['is_static_page'] = true;
		$this->project = $project;
		
		if ($this->getProjectTemplatePath("templates/header")) {
			$this->renderProjectPage('pages/frontpage', $project, $data);
		} else {
			$this->renderPage('project_nyi', $data);
		}
	}
}

?>
