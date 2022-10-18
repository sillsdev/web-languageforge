<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Dto\RightsHelper;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Script extends Base
{
    public function run(Request $request, Application $app, $folder = "", $scriptName = "", $runType = "test")
    {
        $this->data["controlpanel"] = false;
        $this->data["runtype"] = $runType;

        if (!file_exists("Api/Library/Shared/Script/$folder/$scriptName.php")) {
            // show list of scripts
            $this->data["scriptnames"] = $this->scriptBaseNames();
            $this->data["controlpanel"] = true;
            return $this->renderPage($app, "scriptoutput");
        } else {
            // run script and render output
            $this->data["scriptrunurl"] = "/script/$folder/$scriptName/run";

            $userId = SilexSessionHelper::getUserId($app);

            if (!RightsHelper::hasSiteRight($userId, Domain::PROJECTS + Operation::DELETE)) {
                $app->abort(403, "You have insufficient privileges to run scripts"); // this terminates PHP
            } else {
                try {
                    $className = "Api\\Library\\Shared\\Script\\$folder\\$scriptName";
                    $script = new $className();

                    $this->data["scriptname"] = $className . "->run()";
                    $this->data["output"] = "";
                    if ($runType != "run") {
                        $this->data["scriptname"] = "[TEST RUN] " . $this->data["scriptname"];
                    }
                    $this->data["output"] .= $script->run($userId, $runType);

                    return $this->renderPage($app, "scriptoutput");
                } catch (\Exception $e) {
                    var_dump($e);
                    $app->abort(500, "Looks like there was a problem with the script $className"); // this terminates PHP
                }
            }
        }
    }

    private function scriptBaseNames()
    {
        $folderPath = APPPATH . "Api/Library/Shared/Script/";
        $baseNames = self::recursiveDirectorySearch($folderPath, "/.*\.php/");
        $file_count = count($baseNames);
        for ($i = 0; $i < $file_count; $i++) {
            $scriptFilename = substr(
                $baseNames[$i],
                strlen($folderPath),
                strlen($baseNames[$i]) - strlen($folderPath) - 4
            );
            if (strpos($baseNames[$i], "/retired/") === false && $scriptFilename != "scriptConfig") {
                $baseNames[$i] = $scriptFilename;
            } else {
                unset($baseNames[$i]);
            }
        }

        return $baseNames;
    }

    private static function recursiveDirectorySearch($folder, $pattern)
    {
        $dir = new \RecursiveDirectoryIterator($folder);
        $ite = new \RecursiveIteratorIterator($dir);
        $files = new \RegexIterator($ite, $pattern, \RegexIterator::GET_MATCH);
        $fileList = [];
        foreach ($files as $file) {
            $fileList = array_merge($fileList, $file);
        }
        return $fileList;
    }
}
