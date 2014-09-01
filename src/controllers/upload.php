<?php

use models\shared\dto\RightsHelper;
use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\scriptureforge\SfchecksProjectModel;
use models\ProjectModel;
use models\TextModel;

require_once 'secure_base.php';

class Upload extends Secure_base {

	public function receive($app, $fileType) { // e.g. 'lf', 'entry-audio'
		$file = $_FILES['file'];
		
		if ($file['error'] == UPLOAD_ERR_OK) {
			
			// Call the api here
			if ($app == 'sf-checks') {
				$api = new Sf($this);
				
				// Do whatever permissions / rights check that should be done.
				
				$result = $api->sfChecks_uploadFile($fileType);
				
			} else if ($app == 'lf-lexicon') {
				$api = new Sf($this);
				
				// Do whatever permissions / rights check that should be done.
				
				$result = $api->lex_uploadFile($fileType);
				
			} else {
				// Return some kind of programmer isn't that clever error.
			}

		}
//  		header("Content-Type", "text/javascript");
		return json_encode($result); // Might need to set the header to get the content type ?
	}
	
}

?>
