<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\ErrorResult;
use Api\Model\Shared\Command\ImportResult;
use Api\Model\Shared\Command\MediaResult;
use Api\Model\Shared\Command\UploadResponse;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LiftImport;
use Api\Model\Languageforge\Lexicon\LiftMergeRule;
use Palaso\Utilities\FileUtilities;

class LexUploadCommands
{
    private static $allowedLiftExtensions = array(
        ".lift"
    );

    /**
     * Upload an audio file
     *
     * @param string $projectId
     * @param string $mediaType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function uploadAudioFile($projectId, $mediaType, $tmpFilePath)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if ($mediaType != 'audio') {
            throw new \Exception("Unsupported upload type.");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileNamePrefix = date("YmdHis");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

        $allowedTypes = array(
            "audio/mpeg",
            "audio/mp3",
            "audio/x-wav"
        );
        $allowedExtensions = array(
            ".mp3",
            ".wav"
        );

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {

            // make the folders if they don't exist
            $project->createAssetsFolders();
            $folderPath = $project->getAudioFolderPath();

            // move uploaded file from tmp location to assets
            $filePath = self::mediaFilePath($folderPath, $fileNamePrefix, $fileName);
            $moveOk = copy($tmpFilePath, $filePath);
            @unlink($tmpFilePath);

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new MediaResult();
                $data->path = $project->getAudioFolderPath($project->getAssetsRelativePath());
                $data->fileName = $fileNamePrefix . '_' . $fileName;
                $response->result = true;

                if (array_key_exists('previousFilename', $_POST)) {
                    $previousFilename = $_POST['previousFilename'];
                    self::deleteMediaFile($projectId, $mediaType, $previousFilename);
                }
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
     * Upload an image file
     *
     * @param string $projectId
     * @param string $mediaType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function uploadImageFile($projectId, $mediaType, $tmpFilePath)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if ($mediaType != 'sense-image') {
            throw new \Exception("Unsupported upload type.");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileNamePrefix = date("YmdHis");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

        $allowedTypes = array(
            "image/jpeg",
            "image/jpg",
            "image/png"
        );
        $allowedExtensions = array(
            ".jpg",
            ".jpeg",
            ".png"
        );

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {

            // make the folders if they don't exist
            $project->createAssetsFolders();
            $folderPath = $project->getImageFolderPath();

            // move uploaded file from tmp location to assets
            $filePath = self::mediaFilePath($folderPath, $fileNamePrefix, $fileName);
            $moveOk = copy($tmpFilePath, $filePath);
            @unlink($tmpFilePath);

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new MediaResult();
                $data->path = $project->getImageFolderPath($project->getAssetsRelativePath());
                $data->fileName = $fileNamePrefix . '_' . $fileName;
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
                $data->errorMessage = "$fileName is not an allowed image file. No image file formats are currently enabled, contact your Site Administrator.";
            } elseif (count($allowedExtensions) == 1) {
                $data->errorMessage = "$fileName is not an allowed image file. Ensure the file is a $allowedExtensionsStr.";
            } else {
                $data->errorMessage = "$fileName is not an allowed image file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
            $response->result = false;
        }

        $response->data = $data;
        return $response;
    }

    /**
     *
     * @param string $projectId
     * @param string $mediaType, options are 'image'.
     * @param string $fileName
     * @throws \Exception
     * @return UploadResponse
     */
    public static function deleteMediaFile($projectId, $mediaType, $fileName) {
        $response = new UploadResponse();
        $response->result = false;
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        switch ($mediaType) {
            case 'audio':
                $folderPath = $project->getAudioFolderPath();
                break;
            case 'sense-image':
                $folderPath = $project->getImageFolderPath();
                break;
            default:
                $errorMsg = "Error in function deleteImageFile, unsupported mediaType: $mediaType";
                throw new \Exception($errorMsg) ;
                $data = new ErrorResult();
                $data->errorType = 'Exception';
                $data->errorMessage = $errorMsg;
                return $response;
        }
        $filePath = $folderPath . '/' . $fileName;
        if (file_exists($filePath) and ! is_dir($filePath)) {
            if (unlink($filePath)) {
                $data = new MediaResult();
                $data->path = $folderPath;
                $data->fileName = $fileName;
                $response->result = true;
            } else {
                $data = new ErrorResult();
                $data->errorType = 'UserMessage';
                $data->errorMessage = "$fileName could not be deleted. Contact your Site Administrator.";
            }
            return $response;
        }
        $data = new ErrorResult();
        $data->errorType = 'UserMessage';
        $data->errorMessage = "$fileName does not exist in this project. Contact your Site Administrator.";
        return $response;
    }

    /**
     *
     * @param string $folderPath
     * @param string $fileNamePrefix
     * @param string $originalFileName
     * @return string
     */
    public static function mediaFilePath($folderPath, $fileNamePrefix, $originalFileName)
    {
        return $folderPath . DIRECTORY_SEPARATOR . $fileNamePrefix . '_' . $originalFileName;
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
        $cleanupFiles = glob($folderPath . DIRECTORY_SEPARATOR . $fileNamePrefix . '*[' . implode(', ', $allowedExtensions) . ']');
        foreach ($cleanupFiles as $cleanupFile) {
            @unlink($cleanupFile);
        }
    }

    /**
     * Import a project zip file
     *
     * @param string $projectId
     * @param string $mediaType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function importProjectZip($projectId, $mediaType, $tmpFilePath)
    {
        if ($mediaType != 'import-zip') {
            throw new \Exception("Unsupported upload type.");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        if (array_key_exists('mergeRule', $_POST)) {
            $mergeRule = $_POST['mergeRule'];
        }
        $skipSameModTime = false;
        if (array_key_exists('skipSameModTime', $_POST)) {
            $skipSameModTime = $_POST['skipSameModTime'];
        }
        $deleteMatchingEntry = false;
        if (array_key_exists('deleteMatchingEntry', $_POST)) {
            $deleteMatchingEntry = $_POST['deleteMatchingEntry'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

        $allowedTypes = array(
            "application/zip",
            "application/octet-stream",
            "application/x-7z-compressed"
        );
        $allowedExtensions = array(
            ".zip",
            ".zipx",
            ".7z"
        );

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {

            // make the folders if they don't exist
            $project = new LexProjectModel($projectId);
            $project->createAssetsFolders();
            $folderPath = $project->getAssetsFolderPath();

            // move uploaded file from tmp location to assets
            $filePath =  $folderPath . DIRECTORY_SEPARATOR . $fileName;
            $moveOk = copy($tmpFilePath, $filePath);
            @unlink($tmpFilePath);

            // import zip
            if ($moveOk) {
                $importer = LiftImport::get()->importZip($filePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
                $project->write();

                $liftFilename = basename($importer->liftFilePath);
                if (! $project->liftFilePath || $mergeRule != LiftMergeRule::IMPORT_LOSES) {

                    // cleanup previous files of any allowed extension
                    $cleanupFiles = glob($folderPath . '/*[' . implode(', ', self::$allowedLiftExtensions) . ']');
                    foreach ($cleanupFiles as $cleanupFile) {
                        @unlink($cleanupFile);
                    }

                    // copy uploaded LIFT file from extract location to assets
                    $filePath =  $folderPath . DIRECTORY_SEPARATOR . $liftFilename;
                    $project->liftFilePath = $filePath;
                    $project->write();
                    $moveOk = copy($importer->liftFilePath, $filePath);
                }

                // construct server response
                if ($moveOk) {
                    $data = new ImportResult();
                    $data->path = $project->getAssetsRelativePath();
                    $data->fileName = $fileName;
                    $data->stats = $importer->stats;
                    $data->importErrors = $importer->getReport()->toFormattedString();
                    $response->result = true;
                } else {
                    $data = new ErrorResult();
                    $data->errorType = 'UserMessage';
                    $data->errorMessage = "$liftFilename could not be saved to the right location. Contact your Site Administrator.";
                    $response->result = false;
                }
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
                $data->errorMessage = "$fileName is not an allowed compressed file. No compressed file formats are currently enabled, contact your Site Administrator.";
            } elseif (count($allowedExtensions) == 1) {
                $data->errorMessage = "$fileName is not an allowed compressed file. Ensure the file is a $allowedExtensionsStr.";
            } else {
                $data->errorMessage = "$fileName is not an allowed compressed file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
            $response->result = false;
        }

        $response->data = $data;
        return $response;
    }

    /**
     * Import a LIFT file
     *
     * @param string $projectId
     * @param string $mediaType
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function importLiftFile($projectId, $mediaType, $tmpFilePath)
    {
        if ($mediaType != 'import-lift') {
            throw new \Exception("Unsupported upload type.");
        }
        if (! $tmpFilePath) {
            throw new \Exception("Upload controller did not move the uploaded file.");
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $mergeRule = $_POST['mergeRule'];
        $skipSameModTime = $_POST['skipSameModTime'];
        $deleteMatchingEntry = $_POST['deleteMatchingEntry'];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);
        $allowedTypes = array(
            "text/xml",
            "application/xml"
        );

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), self::$allowedLiftExtensions)) {

            // make the folders if they don't exist
            $project = new LexProjectModel($projectId);
            $project->createAssetsFolders();
            $folderPath = $project->getAssetsFolderPath();

            $importer = LiftImport::get()->merge($tmpFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
            $project->write();

            $moveOk = true;
            if (! $project->liftFilePath || $mergeRule != LiftMergeRule::IMPORT_LOSES) {

                // cleanup previous files of any allowed extension
                $cleanupFiles = glob($folderPath . '/*[' . implode(', ', self::$allowedLiftExtensions) . ']');
                foreach ($cleanupFiles as $cleanupFile) {
                    @unlink($cleanupFile);
                }

                // move uploaded LIFT file from tmp location to assets
                $filePath =  $folderPath . DIRECTORY_SEPARATOR . $fileName;
                $project->liftFilePath = $filePath;
                $project->write();
                $moveOk = copy($tmpFilePath, $filePath);
                @unlink($tmpFilePath);
            }

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new ImportResult();
                $data->path = $project->getAssetsRelativePath();
                $data->fileName = $fileName;
                $data->stats = $importer->stats;
                $data->importErrors = $importer->getReport()->toFormattedString();
                $response->result = true;
            } else {
                $data = new ErrorResult();
                $data->errorType = 'UserMessage';
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", self::$allowedLiftExtensions);
            $data = new ErrorResult();
            $data->errorType = 'UserMessage';
            if (count(self::$allowedLiftExtensions) < 1) {
                $data->errorMessage = "$fileName of type: $fileType is not an allowed LIFT file. No LIFT file formats are currently enabled, contact your Site Administrator.";
            } elseif (count(self::$allowedLiftExtensions) == 1) {
                $data->errorMessage = "$fileName of type: $fileType is not an allowed LIFT file. Ensure the file is a $allowedExtensionsStr.";
            } else {
                $data->errorMessage = "$fileName of type: $fileType is not an allowed LIFT file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
            $response->result = false;
        }

        $response->data = $data;
        return $response;
    }
}
