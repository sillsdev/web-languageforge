<?php

class Api extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
	}
	
	// TODO add in security controller when that's available CP 2013-06
	public function service($api) {
		$serviceFileName = strtolower($api) . '.php';
		$serviceClassName = str_replace(' ', '', ucwords(preg_replace('/[\s_]+/', ' ', $api)));
		$filePath = 'service/' . $serviceFileName;
		if (!file_exists($filePath)) {
			throw new Exception(sprintf("File not found '%s' for api '%s'", $filePath, $api));
		} 
		require_once($filePath);
		if (!class_exists($serviceClassName)) {
			throw new Exception(sprintf("Service class '%s' not found in file '%s'", $serviceClassName, $filePath));
		}
		$service = new $serviceClassName;
		libraries\sf\JsonRpcServer::handle($service, $this->output);
	}
	
}

?>