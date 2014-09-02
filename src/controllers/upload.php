<?php
require_once 'secure_base.php';

class Upload extends Secure_base
{

    public function receive($app, $uploadType)
    { // e.g. 'lf', 'entry-audio'

        // Need to require this after the autoloader is loaded, hence it is here.
        require_once 'service/sf.php';

        $result = array();

        $file = $_FILES['file'];

        if ($file['error'] == UPLOAD_ERR_OK) {

            // Call the api here
            if ($app == 'sf-checks') {
                $api = new Sf($this);

                // Do whatever permissions / rights check that should be done.

                $result = $api->sfChecks_uploadFile($uploadType);
            } else
                if ($app == 'lf-lexicon') {
                    $api = new Sf($this);

                    // Do whatever permissions / rights check that should be done.

                    $result = $api->lex_uploadFile($uploadType);
                } else {
                    // Return some kind of programmer isn't that clever error.
                }
        }
        // header("Content-type: text/javascript");
        return json_encode($result); // Might need to set the header to get the content type ?
    }
}

?>
