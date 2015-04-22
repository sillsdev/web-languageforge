<?php

use models\shared\rights\Domain;

use models\shared\rights\Operation;

use models\shared\dto\RightsHelper;

require_once 'secure_base.php';

class script extends Secure_base
{
    public function view($folder = '', $script = '', $runtype = 'test')
    {
        if ( ! file_exists("libraries/shared/scripts/$folder/$script.php")) {
            show_404($this->site);
        } else {
            $userId = (string) $this->session->userdata('user_id');
            if (! RightsHelper::hasSiteRight($userId, Domain::PROJECTS + Operation::DELETE)) {
                show_error("You have insufficient privileges to run scripts", 403, 'Insufficient Privileges');
            } else {
                try {
                    $classname = "libraries\shared\scripts\\$folder\\$script";

                    $this->data['output'] = '';
                    if ($runtype != 'run' && strtolower($folder) != 'control' && strtolower($script) != 'panel') {
                        $this->data['output'] .= "--------------- THIS IS A TEST RUN - The database should not be modified ----------------\n\n";
                    }
                    $script = new $classname();
                    $this->data['output'] .= $script->run($userId, $runtype);
                    $this->data['scriptname'] = $classname . "->run()";
                    $this->renderPage("textoutput");
                } catch (\Exception $e) {
                    show_error("Looks like there was a problem with the script $classname", 500, 'Script Error');
                }
            }
        }
    }
}
