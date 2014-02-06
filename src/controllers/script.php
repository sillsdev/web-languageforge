<?php 

use models\rights\Domain;

use models\rights\Operation;

use models\dto\RightsHelper;

use models\rights\Realm;
use models\rights\Roles;

require_once 'secure_base.php';

class Script extends Secure_base {
	
	public function view($folder = '', $script = '') {
		if ( ! file_exists("libraries/scripts/$folder/$script.php")) {
			show_404();
		} else {
			$userId = (string)$this->session->userdata('user_id');
			if (! RightsHelper::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT)) {
				show_error("You must be a site admin to run scripts", 403, 'Insufficient Privileges');
			} else {
				try {
					$data = array();
					$classname = "libraries\scripts\\$folder\\$script"; 

					$script = new $classname;
					$data['output'] = $script->run();
					$data['scriptname'] = $classname . "->run()";
					$this->renderPage("textoutput", $data);
				} catch (\Exception $e) {
					show_error("Looks like there was a problem with the script $classname", 500, 'Script Error');
				}
			}
		}
	}
}

?>
