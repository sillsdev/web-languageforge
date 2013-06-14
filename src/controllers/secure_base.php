<?php

require_once 'base.php';

class Secure_base extends Base {
	
	function __construct() {
		parent::__construct();
		$this->load->library('ion_auth');
		$this->load->helper('url');
		if (!$this->ion_auth->logged_in())
		{
			//redirect them to the login page
			redirect('auth/login', 'refresh');
		}
	}
}

?>