<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\JsonRpcServer;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Api
{
    public function service(Request $request, Application $app, $apiName)
    {
        $fileBase = str_replace(" ", "", ucwords(preg_replace("/[\s_]+/", " ", $apiName)));
        $serviceFileName = $fileBase . ".php";
        $serviceClassName = "\\Api\\Service\\" . $fileBase;
        $filePath = "Api/Service/" . $serviceFileName;

        if (!file_exists($filePath)) {
            throw new \Exception(sprintf("File not found '%s' for api '%s'", $filePath, $apiName));
        }
        if (!class_exists($serviceClassName)) {
            throw new \Exception(sprintf("Service class '%s' not found in file '%s'", $serviceClassName, $filePath));
        }

        require_once $filePath;
        $service = new $serviceClassName($app);

        return $app->json(JsonRpcServer::handle($request, $app, $service), 200);
    }
}
