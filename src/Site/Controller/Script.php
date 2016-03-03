<?php

namespace Site\Controller;

use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Dto\RightsHelper;
use Silex\Application;

class Script extends Base
{
    public function view(Application $app, $folder = '', $scriptName = '', $runType = 'test') {
        $this->data['controlpanel'] = false;
        $this->data['runtype'] = $runType;
        if (! file_exists("Api/Library/Shared/Script/$folder/$scriptName.php")) {
            // show list of scripts
            $this->data['scriptnames'] = $this->scriptBaseNames();
            $this->data['controlpanel'] = true;
            return $this->renderPage($app, 'scriptoutput');
        } else {
            // run script and render output
            $this->data['scriptrunurl'] = '/script/Migration/' . $scriptName . '/run';
            if (get_class($app['security.token_storage']->getToken()->getUser()) == 'Site\Model\UserWithId')  {
                $userId = $app['security.token_storage']->getToken()->getUser()->getUserId();
            }
            if (! RightsHelper::hasSiteRight($userId, Domain::PROJECTS + Operation::DELETE)) {
                $app->abort(403, 'You have insufficient privileges to run scripts'); // this terminates PHP
            } else {
                try {
                    $className = "Api\\Library\\Shared\\Script\\$folder\\$scriptName";
                    $script = new $className();

                    $this->data['scriptname'] = $className.'->run()';
                    $this->data['output'] = '';
                    if ($runType != 'run') {
                        $this->data['scriptname'] = "[TEST RUN] " . $this->data['scriptname'];
                    }
                    $this->data['output'] .= $script->run($userId, $runType);

                    return $this->renderPage($app, 'scriptoutput');
                } catch (\Exception $e) {
                    var_dump($e);
                    $app->abort(500, "Looks like there was a problem with the script $className"); // this terminates PHP
                }
            }
        }
    }

    private function scriptBaseNames() {
        $folderPath = APPPATH.'Api/Library/Shared/Script/Migration';
        $baseNames = glob($folderPath . '/*.php');
        $file_count = count($baseNames);
        for ($i = 0; $i < $file_count; $i++) {
            $baseNames[$i] = basename($baseNames[$i], '.php');
        }

        return $baseNames;
    }
}
