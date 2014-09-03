<?php
// use libraries\shared\palaso\exceptions\ErrorHandler;
// use libraries\shared\palaso\exceptions\ResourceNotAvailableException;
// use libraries\shared\palaso\exceptions\UserNotAuthenticatedException;
// use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use libraries\shared\palaso\CodeGuard;

require_once 'secure_base.php';

class Upload extends Secure_base
{

    public function receive($app, $uploadType) // e.g. 'lf', 'entry-audio'
    {
        // Need to require this after the autoloader is loaded, hence it is here.
        require_once 'service/sf.php';

        // user-defined error handler to catch annoying php errors and throw them as exceptions
        // set_error_handler(function ($errno, $errstr, $errfile, $errline) { throw new ErrorHandler($errstr, 0, $errno, $errfile, $errline); } , E_ALL);

        $response = array();

        $file = $_FILES['file'];

        if ($file['error'] == UPLOAD_ERR_OK) {

            try {

                // Call the api here
                if ($app == 'sf-checks') {
                    $api = new Sf($this);
                    $api->checkPermissions('sfChecks_uploadFile', $uploadType);
                    $response = $api->sfChecks_uploadFile($uploadType);
                } elseif ($app == 'lf-lexicon') {
                    $api = new Sf($this);
                    $api->checkPermissions('lex_uploadFile', $uploadType);
                    $response = $api->lex_uploadFile($uploadType);
                } else {
                    // Return some kind of programmer isn't that clever error.
                    throw new \Exception("Unsupported upload app.");
                }
            } catch (\Exception $e) {
                $response = array(
                    'result' => false,
                    'data' => array(
                        'errorType' => get_class($e),
                        'errorMessage' => $e->getMessage() . " line " . $e->getLine() . " " . $e->getFile() . " " . CodeGuard::getStackTrace($e->getTrace())
                    )
                );
//                 if ($e instanceof ResourceNotAvailableException) {
//                     $response['data']['errorType'] = 'ResourceNotAvailableException';
//                     $response['data']['errorMessage'] = $e->getMessage();
//                 } elseif ($e instanceof UserNotAuthenticatedException) {
//                     $response['data']['errorType'] = 'UserNotAuthenticatedException';
//                     $response['data']['errorMessage'] = $e->getMessage();
//                 } elseif ($e instanceof UserUnauthorizedException) {
//                     $response['data']['errorType'] = 'UserUnauthorizedException';
//                     $response['data']['errorMessage'] = $e->getMessage();
//                 }
                $message = '';
                $message .= $e->getMessage() . "\n";
                $message .= $e->getTraceAsString() . "\n";
                error_log($message);
            }
        }

        $output = $this->output;
        $output->set_content_type('text/javascript');
        $output->set_output(json_encode($response));
    }
}

?>
