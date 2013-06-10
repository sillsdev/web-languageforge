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