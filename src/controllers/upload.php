<?php
require_once 'secure_base.php';

class Upload extends Secure_base
{

    public function receive($app, $uploadType) // e.g. 'lf', 'entry-audio'
    {
        // Need to require this after the autoloader is loaded, hence it is here.
        require_once 'service/sf.php';

        $response = array();

        $file = $_FILES['file'];

        if ($file['error'] == UPLOAD_ERR_OK) {

            // Call the api here
            if ($app == 'sf-checks') {
                $api = new Sf($this);

                // Do whatever permissions / rights check that should be done.
                // $api->checkPermissions('sfChecks_uploadFile', $uploadType);

                $response = $api->sfChecks_uploadFile($uploadType);
            } elseif ($app == 'lf-lexicon') {
                $api = new Sf($this);

                // Do whatever permissions / rights check that should be done.
                // $api->checkPermissions('lex_uploadFile', $uploadType);

                $response = $api->lex_uploadFile($uploadType);
            } else {
                // Return some kind of programmer isn't that clever error.
                throw new \Exception("Unsupported upload app.");
            }
        }

        $output = $this->output;
        $output->set_content_type('text/javascript');
        $output->set_output(json_encode($response));
    }
}

?>
