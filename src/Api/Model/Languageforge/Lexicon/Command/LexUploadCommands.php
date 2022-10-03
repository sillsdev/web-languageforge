<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\ErrorResult;
use Api\Model\Shared\Command\ImportResult;
use Api\Model\Shared\Command\MediaResult;
use Api\Model\Shared\Command\UploadResponse;
use Api\Model\Languageforge\Lexicon\Import\LiftImport;
use Api\Model\Languageforge\Lexicon\Import\LiftMergeRule;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
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
            "application/octet-stream",

            // allow m4a audio uploads, which curiously has a mime type of video/mp4, audio/m4a, audio/mp4, or audio/x-m4a
            "video/mp4",
            "audio/m4a",
            "audio/mp4",
            "audio/x-m4a",
            "audio/mpeg",
            "audio/x-mpeg",
            "audio/mp3",
            "audio/x-mp3",
            "audio/mpeg3",
            "audio/x-mpeg3",
            "audio/mpg",
            "audio/x-mpg",
            "audio/x-mpegaudio",
            "audio/x-wav",
            "audio/wav",
            "audio/flac",
            "audio/x-flac",
            "audio/ogg",
            "audio/webm",
            // allow Google Chrome to handle MediaRecorder recordings as video/webm MimeType
            "video/webm"
        );
        $allowedExtensions = array(
            ".mp3",
            ".mpa",
            ".mpg",
            ".m4a",
            ".wav",
            ".ogg",
            ".flac",
            ".webm",
        );

        $response = new UploadResponse();

        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {

            // make the folders if they don't exist
            $project->createAssetsFolders();
            $folderPath = $project->getAudioFolderPath();

            // move original uploaded/recorded file from tmp location to assets
            $filePath = self::mediaFilePath($folderPath, $fileNamePrefix, $fileName);
            $moveOk = copy($tmpFilePath, $filePath);

            // convert audio file to mp3 or wav format if necessary
            // FLEx only supports mp3 or wav format as of 2022-09

            if (strcmp(strtolower($fileExt), ".mp3") !== 0 && strcmp(strtolower($fileExt), ".wav") !== 0) {
                //First, find the duration of the file
                $ffprobeCommand = `ffprobe -i $tmpFilePath -show_entries format=duration -v quiet -of csv="p=0" 2> /dev/null`;
                $audioDuration = floatval($ffprobeCommand);

                // Convert to .wav if the result will be less than 1 MB (recording is shorter than 5.6 seconds)
                // and .mp3 otherwise (recording is longer than 5.6 seconds)
                $extensionlessFileName = substr($fileName, 0, strrpos($fileName, strtolower($fileExt)));
                $convertedExtension = ($audioDuration < 5.6) ? 'wav' : 'mp3';
                $fileName = "$extensionlessFileName.$convertedExtension"; //$fileName ->> the converted file
                `ffmpeg -i $tmpFilePath $fileName 2> /dev/null`; //original file is at the tmpFilePath. convert that file and save it to be $fileName
                $filePath = self::mediaFilePath($folderPath, $fileNamePrefix, $fileName);
                $moveOk = copy($fileName, $filePath);

                //unlink the converted file from its temporary location
                @unlink($fileName);

                //unlink the original file as well, now that we've both stored it and made the converted copy
                @unlink($tmpFilePath);

            }

            // construct server response
            if ($moveOk && $tmpFilePath) {
                $data = new MediaResult();
                $data->path = $project->getAudioFolderPath($project->getAssetsRelativePath());
                $data->fileName = $fileNamePrefix . '_' . $fileName; //if the file has been converted, $fileName = converted file
                $response->result = true;

                //Uncomment to ensure that only one format for each audio file is stored in the assets. We want to keep up to two formats right now (09-2022): the original and if needed, a FLEx-compatible one
                // if (array_key_exists('previousFilename', $_POST)) {
                //     $previousFilename = $_POST['previousFilename'];
                //     self::deleteMediaFile($projectId, $mediaType, $previousFilename);
                // }
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
            // SVG disabled until we can ensure no embedded Javascript; see https://github.com/w3c/svgwg/issues/266
            // "image/svg+xml",
            "image/gif",
            "image/png"
        );
        $allowedExtensions = array(
            ".jpg",
            ".jpeg",
            // ".svg",
            ".gif",
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
        $mergeRule = self::extractStringFromArray($_POST, 'mergeRule', LiftMergeRule::IMPORT_WINS);
        $skipSameModTime = self::extractBooleanFromArray($_POST, 'skipSameModTime');
        $deleteMatchingEntry = self::extractBooleanFromArray($_POST, 'deleteMatchingEntry');

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
        $mergeRule = self::extractStringFromArray($_POST, 'mergeRule', LiftMergeRule::IMPORT_WINS);
        $skipSameModTime = self::extractBooleanFromArray($_POST, 'skipSameModTime');
        $deleteMatchingEntry = self::extractBooleanFromArray($_POST, 'deleteMatchingEntry');

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

    /**
     * @param array $array
     * @param string $key
     * @param string $defaultValue
     * @return string
     */
    private static function extractStringFromArray($array, $key, $defaultValue): string
    {
        $result = $defaultValue;
        if (array_key_exists($key, $array)) {
            $result = $array[$key];
        }
        return $result;
    }

    /**
     * @param array $array
     * @param string $key
     * @param bool $defaultValue
     * @return bool
     */
    private static function extractBooleanFromArray($array, $key, $defaultValue = false): bool
    {
        $result = $defaultValue;
        if (array_key_exists($key, $array)) {
            if (is_bool($array[$key])) {
                $result = $array[$key];
            } else {
                $result = (strtolower($array[$key]) == 'true');
            }
        }
        return $result;
    }
}
