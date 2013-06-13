<?php 

class Pages extends CI_Controller {
	
	public function header($data) {
		// all pages have a header
		$this->load->view('templates/header.html.php', $data);
	}
	
	public function footer($data) {
		// all pages have a header
		$this->load->view('templates/footer.html.php', $data);
	}
	
	public function view($page = 'frontpage') {
		$data = array();
		$data['page'] = $page;
		$data['logged_in'] = $this->ion_auth->logged_in();
		if ($data['logged_in']) {
			$data['user_email'] = $this->ion_auth->get_user_id();
			$user_query = $this->ion_auth_model->user($this->ion_auth->get_user_id());
			$user = $user_query->row();
			$data['user_name'] = $user->first_name;
			$data['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
		}
		$data['title'] = "Scripture Forge";
		if ( ! file_exists('views/pages/'.$page.'.html.php'))
		{
			show_404();
		} else {
			$this->load->view('templates/container.html.php', $data);
		}
	}
}


?>