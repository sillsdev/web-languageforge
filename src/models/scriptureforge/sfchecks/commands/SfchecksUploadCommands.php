<?php
namespace models\scriptureforge\sfchecks\commands;

use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\TextModel;

class SfchecksUploadCommands
{

    /**
     * Upload a file
     *
     * @param string $projectId
     * @param string $uploadType
     */
    public static function uploadFile($projectId, $uploadType)
    {
        if ($uploadType != 'audio') {
            throw new \Exception("Unsupported upload type.");
        }

        $textId = $_POST['textId'];
        $file = $_FILES['file'];
        $fileType = $file['type'];
        $fileName = $file['name'];

        // replace special characters with _
        $search = array(
            '/',
            '\\',
            '?',
            '%',
            '*',
            ':',
            '|',
            '"',
            '<',
            '>'
        );
        $fileName = str_replace($search, '_', $fileName);

        $fileName = $textId . '_' . $fileName;
        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

        // allowed types: documented, observed
        $allowedTypes = array(
            "audio/mpeg",
            "audio/mp3"
        );
        $allowedExtensions = array(
            ".mp3"
        );

        if (in_array($fileType, $allowedTypes) && in_array($fileExt, $allowedExtensions)) {

            // make the folder if it doesn't exist
            $path = 'assets/' . $projectId;
            $folderPath = APPPATH . $path;
            if (! file_exists($folderPath) and ! is_dir($folderPath)) {
                mkdir($folderPath);
            }

            // cleanup previous files of any allowed extension
            $cleanupFiles = glob($folderPath . '/' . $textId . '*[' . implode(', ', $allowedExtensions) . ']');
            foreach ($cleanupFiles as $cleanupFile) {
                @unlink($cleanupFile);
            }

            // move uploaded file from tmp location to assets
            $filePath = $folderPath . '/' . $fileName;
            $moveOk = move_uploaded_file($file['tmp_name'], $filePath);

            // update database with file location
            $url = '';
            if ($moveOk) {
                $url = "$path/$fileName";
            }
            $project = new ProjectModel($projectId);
            $text = new TextModel($project, $textId);
            $text->audioUrl = $url;
            $text->write();

            $data = new MediaResult();
            $data->url = $url;
            $data->path = $path;
            $data->fileName = $fileName;
            $response = new Response();
            $response->result = true;
            $response->data = $data;
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            // Ummm ditch the echos below and make them part of the result structure.
            $data = new ErrorResult();
            if (count($allowedExtensions) < 1) {
                $data->error = "$fileName is not an allowed audio file. No audio file formats are currently enabled.";
            } elseif (count($allowedExtensions) == 1) {
                $data->error = "$fileName is not an allowed audio file. Ensure the file is an $allowedExtensionsStr.";
            } else {
                $data->error = "$fileName is not an allowed audio file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
            $response = new Response();
            $response->result = false;
            $response->data = $data;
        }

        return JsonEncoder::encode($response);
    }
}

class MediaResult
{

    /**
     *
     * @var string
     */
    public $url;

    /**
     *
     * @var string
     */
    public $path;

    /**
     *
     * @var string
     */
    public $fileName;
}

class ErrorResult
{

    /**
     * Error message
     *
     * @var string
     */
    public $error;
}

class Response
{

    /**
     *
     * @var bool
     */
    public $result;

    /**
     *
     * @var MediaResult or ErrorResult
     */
    public $data;
}

?>
