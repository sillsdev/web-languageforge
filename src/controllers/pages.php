<?php 

class Pages extends CI_Controller {
	
	public function view($page = 'frontpage') {
		if ( ! file_exists('views/pages/'.$page.'.html.php'))
		{
			show_404();
		}
		
		$data['title'] = ucfirst($page); // Capitalize the first letter
		
		$this->load->view('templates/header.html.php', $data);
		$this->load->view('pages/'.$page.'.html.php', $data);
		$this->load->view('templates/footer.html.php', $data);
	}
}


?>