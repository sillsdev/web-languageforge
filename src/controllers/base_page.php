<?php 

class Base_Page extends CI_Controller {
	
	public function header($data) {
		// all pages have a header
		$this->load->view('templates/header.html.php', $data);
	}
	
	public function footer($data) {
		// all pages have a header
		$this->load->view('templates/footer.html.php', $data);
	}
	
	public function view($page) {
		$data = array();
		$this->header($data);
		if ( ! file_exists('views/pages/'.$page.'.html.php'))
		{
			show_404();
		} else {
			$this->view_page($page, $data);
		}
		$this->footer($data);
	}
	
	public function view_page($page = 'frontpage') {
		// a basic page controller.  Override as necessary
		
		$data['title'] = ucfirst($page); // Capitalize the first letter
		$this->load->view('pages/'.$page.'.html.php', $data);
	}
}


?>