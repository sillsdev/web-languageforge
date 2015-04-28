<?php
use libraries\shared\palaso\exceptions\ErrorHandler;
use libraries\shared\palaso\exceptions\ResourceNotAvailableException;
use libraries\shared\palaso\exceptions\UserNotAuthenticatedException;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use Palaso\Utilities\CodeGuard;

require_once 'secure_base.php';

use service\sf;

class Upload extends Secure_base
{

    public function receive($app, $mediaType) // e.g. 'lf', 'entry-audio'
    {
        // Need to require this after the autoloader is loaded, hence it is here.
        //require_once 'service/sf.php';

        // user-defined error handler to catch annoying php errors and throw them as exceptions
        ini_set('xdebug.show_exception_trace', 0);
        set_error_handler(function ($errno, $errstr, $errfile, $errline)
        {
            throw new ErrorHandler($errstr, 0, $errno, $errfile, $errline);
        }, E_ALL);

        $response = array();

        try {
            // check for mocked E2E upload
            $filePath = sys_get_temp_dir() . '/' . $_POST['filename'];
            if (file_exists($filePath) && ! is_dir($filePath)) {
                $file = array(
                    'name' => $_POST['filename'],
                    'error' => UPLOAD_ERR_OK
                );
                $tmpFilePath = $filePath;
                $_FILES['file'] = $file;
            } else {
                $file = $_FILES['file'];
            }

            if ($file['error'] == UPLOAD_ERR_OK) {
                if (! isset($tmpFilePath)) {
                    $tmpFilePath = $this->moveUploadedFile();
                }

                if ($app == 'sf-checks') {
                    $api = new sf($this);
                    $api->checkPermissions('sfChecks_uploadFile', array(
                        $mediaType,
                        $tmpFilePath
                    ));
                    $response = $api->sfChecks_uploadFile($mediaType, $tmpFilePath);
                } elseif ($app == 'lf-lexicon') {
                    $api = new sf($this);
                    switch ($mediaType) {
                        case 'import-zip':
                            $api->checkPermissions('lex_upload_importProjectZip', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_upload_importProjectZip($mediaType, $tmpFilePath);
                            break;
                        case 'sense-image':
                            $api->checkPermissions('lex_uploadImageFile', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_uploadImageFile($mediaType, $tmpFilePath);
                            break;
                        case 'import-lift':
                            $api->checkPermissions('lex_upload_importLift', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_upload_importLift($mediaType, $tmpFilePath);
                            break;
                        default:
                            throw new Exception("Unsupported upload type: $mediaType");
                    }
                } else {
                    throw new Exception("Unsupported upload app: $app");
                }

                // cleanup uploaded file if it hasn't been moved
                if ($tmpFilePath && file_exists($tmpFilePath)) {
                    @unlink($tmpFilePath);
                }
            }
        } catch (\Exception $e) {
            $response = array(
                'result' => false,
                'data' => array(
                    'errorType' => get_class($e),
                    'errorMessage' => $e->getMessage() . " line " . $e->getLine() . " " . $e->getFile() . " " . CodeGuard::getStackTrace($e->getTrace())
                )
            );
            if ($e instanceof ResourceNotAvailableException) {
                $response['data']['errorType'] = 'ResourceNotAvailableException';
                $response['data']['errorMessage'] = $e->getMessage();
            } elseif ($e instanceof UserNotAuthenticatedException) {
                $response['data']['errorType'] = 'UserNotAuthenticatedException';
                $response['data']['errorMessage'] = $e->getMessage();
            } elseif ($e instanceof UserUnauthorizedException) {
                $response['data']['errorType'] = 'UserUnauthorizedException';
                $response['data']['errorMessage'] = $e->getMessage();
            }
            $message = '';
            $message .= $e->getMessage() . "\n";
            $message .= $e->getTraceAsString() . "\n";
            error_log($message);
        }

        $output = $this->output;
        $output->set_content_type('text/javascript');
        $output->set_output(json_encode($response));
    }

    /**
     * Move the uploaded file here in the controller so the upload command can be unit tested
     *
     * @return string|boolean Returns the moved file path on success or false otherwise
     */
    protected function moveUploadedFile()
    {
        $filename = uniqid('upload_', true);
        $filePath = sys_get_temp_dir() . '/' . $filename;
        if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
            return $filePath;
        }
        return false;
    }
}
