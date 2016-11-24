<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\Exception\ErrorHandler;
use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Library\Shared\Palaso\Exception\UserNotAuthenticatedException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Service\Sf;
use Palaso\Utilities\CodeGuard;
use Silex\Application;

class Upload extends Base
{
    public function receive(Application $app, $appType, $mediaType)  { // e.g. 'lf', 'entry-audio'
        // user-defined error handler to catch annoying php errors and throw them as exceptions
        ini_set('xdebug.show_exception_trace', 0);
        set_error_handler(function ($errno, $errstr, $errfile, $errline) {
            throw new ErrorHandler($errstr, 0, $errno, $errfile, $errline);
        }, E_ALL);

        $response = array();
        $status = 201;

        try {
            // check for mocked E2E upload
            if (array_key_exists('file', $_POST)) {
                $filePath = sys_get_temp_dir() . '/' . $_POST['file']['name'];
                if (file_exists($filePath) && !is_dir($filePath)) {
                    $file = $_POST['file'];
                    $file['error'] = UPLOAD_ERR_OK;
                    $tmpFilePath = $filePath;
                    $_FILES['file'] = $file;
                } else {
                    $file = $_FILES['file'];
                }
            } else {
                $file = $_FILES['file'];
            }

            if ($file['error'] == UPLOAD_ERR_OK) {
                if (! isset($tmpFilePath)) {
                    $tmpFilePath = $this->moveUploadedFile();
                }

                if ($appType == 'sf-checks') {
                    $api = new Sf($app);
                    $api->checkPermissions('sfChecks_uploadFile', array(
                        $mediaType,
                        $tmpFilePath
                    ));
                    $response = $api->sfChecks_uploadFile($mediaType, $tmpFilePath);
                } elseif ($appType == 'lf-lexicon') {
                    $api = new Sf($app);
                    switch ($mediaType) {
                        case 'audio':
                            $api->checkPermissions('lex_uploadAudioFile', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_uploadAudioFile($mediaType, $tmpFilePath);
                            break;
                        case 'sense-image':
                            $api->checkPermissions('lex_uploadImageFile', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_uploadImageFile($mediaType, $tmpFilePath);
                            break;
                        case 'import-zip':
                            $api->checkPermissions('lex_upload_importProjectZip', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_upload_importProjectZip($mediaType, $tmpFilePath);
                            break;
                        case 'import-lift':
                            $api->checkPermissions('lex_upload_importLift', array(
                                $mediaType,
                                $tmpFilePath
                            ));
                            $response = $api->lex_upload_importLift($mediaType, $tmpFilePath);
                            break;
                        default:
                            throw new \Exception("Unsupported upload type: $mediaType");
                    }
                } else {
                    throw new \Exception("Unsupported upload app: $appType");
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
                    'errorMessage' => $e->getMessage() . " line " . $e->getLine() . " " . $e->getFile() . " " .
                        CodeGuard::getStackTrace($e->getTrace())
                )
            );
            $status = 400;
            if ($e instanceof ResourceNotAvailableException) {
                $response['data']['errorType'] = 'ResourceNotAvailableException';
                $response['data']['errorMessage'] = $e->getMessage();
                $status = 404;
            } elseif ($e instanceof UserNotAuthenticatedException) {
                $response['data']['errorType'] = 'UserNotAuthenticatedException';
                $response['data']['errorMessage'] = $e->getMessage();
                $status = 401;
            } elseif ($e instanceof UserUnauthorizedException) {
                $response['data']['errorType'] = 'UserUnauthorizedException';
                $response['data']['errorMessage'] = $e->getMessage();
                $status = 403;
            }
            $message = '';
            $message .= $e->getMessage() . "\n";
            $message .= $e->getTraceAsString() . "\n";
            error_log($message);
        }

        return $app->json($response, $status);
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
