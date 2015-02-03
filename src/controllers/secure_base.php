<?php

require_once 'base.php';

class Secure_base extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        if (!$this->_isLoggedIn) {
            //redirect them to the login page
            redirect('auth/login', 'refresh');
        }
    }
}
