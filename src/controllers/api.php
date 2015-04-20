<?php

class api extends CI_Controller
{
    public function service($api)
    {
        $serviceFileName = strtolower($api) . '.php';
        $serviceClassName = '\\service\\' . str_replace(' ', '', ucwords(preg_replace('/[\s_]+/', ' ', $api)));
        $filePath = 'service/' . $serviceFileName;
        if (!file_exists($filePath)) {
            throw new Exception(sprintf("File not found '%s' for api '%s'", $filePath, $api));
        }
        require_once $filePath;
        if (!class_exists($serviceClassName)) {
            throw new Exception(sprintf("Service class '%s' not found in file '%s'", $serviceClassName, $filePath));
        }
        $service = new $serviceClassName($this);
        libraries\shared\palaso\JsonRpcServer::handle($service, $this->output);
    }

}
