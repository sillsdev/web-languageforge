<?php

class Base extends CI_Controller {
	
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
		$this->viewdata['logged_in'] = $this->ion_auth->logged_in();
		if ($this->viewdata['logged_in']) {
			$this->viewdata['is_admin'] = $this->ion_auth->is_admin();
			$this->viewdata['user_email'] = $this->ion_auth->get_user_id();
			$user_query = $this->ion_auth_model->user($this->ion_auth->get_user_id());
			$user = $user_query->row();
			$this->viewdata['user_name'] = $user->first_name;
			$this->viewdata['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
			
		}
		$view_html = $this->load->view('templates/container.html.php', $this->viewdata, !$render);

		if (!$render) return $view_html;
	}
	
}