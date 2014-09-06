<?php
namespace models\scriptureforge\sfchecks\commands;

use models\ProjectModel;
use models\TextModel;

class SfchecksUploadCommands
{

    /**
     * Upload a file
     *
     * @param string $projectId
     * @param string $uploadType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return \models\scriptureforge\sfchecks\commands\UploadResponse
     */
    public static function uploadFile($projectId, $uploadType, $tmpFilePath)
    {
        if ($uploadType != 'audio') {
            throw new \Exception("Unsupported upload type.");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
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

        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

        // allowed types: documented, observed
        $allowedTypes = array(
            "audio/mpeg",
            "audio/mp3"
        );
        $allowedExtensions = array(
            ".mp3"
        );

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {

            // make the folder if it doesn't exist
            $path = self::relativePath($projectId);
            $folderPath = self::folderPath($projectId);
            if (! file_exists($folderPath) and ! is_dir($folderPath)) {
                mkdir($folderPath);
            }

            // cleanup previous files of any allowed extension
            self::cleanupFiles($folderPath, $textId, $allowedExtensions);

            // move uploaded file from tmp location to assets
            $filePath = self::filePath($projectId, $textId, $fileName);
            $moveOk = rename($tmpFilePath, $filePath);

            // update database with file location
            $project = new ProjectModel($projectId);
            $text = new TextModel($project, $textId);
            $text->audioFileName = '';
            if ($moveOk) {
                $text->audioFileName = $fileName;
            }
            $text->write();

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new MediaResult();
                $data->url = '';
                $data->path = $path;
                $data->fileName = $fileName;
                $response->result = true;
            } else {
                $data = new ErrorResult();
                $data->errorType = 'UserMessage';
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            $data = new ErrorResult();
            $data->errorType = 'UserMessage';
            if (count($allowedExtensions) < 1) {
                $data->errorMessage = "$fileName is not an allowed audio file. No audio file formats are currently enabled, contact your Site Administrator.";
            } elseif (count($allowedExtensions) == 1) {
                $data->errorMessage = "$fileName is not an allowed audio file. Ensure the file is an $allowedExtensionsStr.";
            } else {
                $data->errorMessage = "$fileName is not an allowed audio file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
            $response->result = false;
        }

        $response->data = $data;
        return $response;
    }

    /**
     *
     * @param string $projectId
     * @return string
     */
    public static function relativePath($projectId)
    {
        return 'assets/' . $projectId;
    }

    /**
     *
     * @param string $projectId
     * @return string
     */
    public static function folderPath($projectId)
    {
        $path = self::relativePath($projectId);
        return APPPATH . $path;
    }

    /**
     *
     * @param string $projectId
     * @param string $textId
     * @param string $fileName
     * @return string
     */
    public static function filePath($projectId, $textId, $fileName)
    {
        $folderPath = self::folderPath($projectId);
        return $folderPath . '/' . $textId . '_' . $fileName;
    }

    /**
     * cleanup (remove) previous files of any allowed extension for files with the given filename prefix in the given folder
     *
     * @param string $folderPath
     * @param string $fileNamePrefix
     * @param array $allowedExtensions
     */
    public static function cleanupFiles($folderPath, $fileNamePrefix, $allowedExtensions)
    {
        $cleanupFiles = glob($folderPath . '/' . $fileNamePrefix . '*[' . implode(', ', $allowedExtensions) . ']');
        foreach ($cleanupFiles as $cleanupFile) {
            @unlink($cleanupFile);
        }
    }
}
