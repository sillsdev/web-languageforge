<?php

namespace Api\Model\Scriptureforge\Sfchecks\Command;

use Api\Model\Command\ProjectCommands;
use Palaso\Utilities\FileUtilities;
use Api\Model\Shared\Command\UploadResponse;
use Api\Model\Shared\Command\MediaResult;
use Api\Model\Shared\Command\ErrorResult;
use Api\Model\Scriptureforge\SfchecksProjectModel;
use Api\Model\TextModel;

class SfchecksUploadCommands
{

    /**
     * Upload a file
     *
     * @param string $projectId
     * @param string $mediaType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return \Api\Model\Shared\Command\UploadResponse
     */
    public static function uploadFile($projectId, $mediaType, $tmpFilePath)
    {
        if ($mediaType != 'audio') {
            throw new \Exception("Unsupported upload type: $mediaType");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
        }

        $textId = $_POST['textId'];
        $file = $_FILES['file'];
        $fileName = $file['name'];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

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

            // make the folders if they don't exist
            $project = new SfchecksProjectModel($projectId);
            ProjectCommands::checkIfArchivedAndThrow($project);
            $folderPath = $project->getAssetsFolderPath();
            FileUtilities::createAllFolders($folderPath);

            // cleanup previous files of any allowed extension
            self::cleanupFiles($folderPath, $textId, $allowedExtensions);

            // move uploaded file from tmp location to assets
            $filePath = self::mediaFilePath($folderPath, $textId, $fileName);
            $moveOk = copy($tmpFilePath, $filePath);
            @unlink($tmpFilePath);

            // update database with file location
            $text = new TextModel($project, $textId);
            $text->audioFileName = '';
            if ($moveOk) {
                $text->audioFileName = $fileName;
            }
            $text->write();

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new MediaResult();
                $data->path = $project->getAssetsRelativePath();
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
                $data->errorMessage = "$fileName is not an allowed audio file. Ensure the file is a $allowedExtensionsStr.";
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
     * @param string $folderPath
     * @param string $fileNamePrefix
     * @param string $fileName
     * @return string
     */
    public static function mediaFilePath($folderPath, $fileNamePrefix, $fileName)
    {
        return $folderPath . '/' . $fileNamePrefix . '_' . $fileName;
    }

    /**
     * cleanup (remove) previous files of any allowed extension for files with the given filename prefix in the given folder path
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
