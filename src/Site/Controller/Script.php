<?php

namespace Site\Controller;

use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Dto\RightsHelper;
use Silex\Application;

class Script extends Base
{
    public function view(Application $app, $folder = '', $scriptName = '', $runType = 'test') {
        if (! file_exists("Api/Library/Shared/Script/$folder/$scriptName.php")) {
            $app->abort(404, $this->website->base); // this terminates PHP
        } else {
            $userId = (string) $app['session']->get('user_id');
            if (! RightsHelper::hasSiteRight($userId, Domain::PROJECTS + Operation::DELETE)) {
                $app->abort(403, 'You have insufficient privileges to run scripts'); // this terminates PHP
            } else {
                try {
                    $className = "Api\\Library\\Shared\\Script\\$folder\\$scriptName";
                    $script = new $className();

                    $this->data['scriptname'] = $className.'->run()';
                    $this->data['insert'] = '';
                    $this->data['output'] = '';
                    if (strtolower($folder) == 'control' and strtolower($scriptName) == 'panel') {
                        $this->data['insert'] .= $script->run($userId, $runType);
                    } else {
                        if ($runType != 'run') {
                            $this->data['output'] .= "--------------- THIS IS A TEST RUN - The database should not be modified ----------------\n\n";
                        }
                        $this->data['output'] .= $script->run($userId, $runType);
                    }

                    return $this->renderPage($app, 'textoutput');
                } catch (\Exception $e) {
                    $app->abort(500, "Looks like there was a problem with the script $className"); // this terminates PHP
                }
            }
        }
    }
}
