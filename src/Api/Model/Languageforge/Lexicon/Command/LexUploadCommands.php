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
    private static $allowedLiftExtensions = [".lift"];

    /**
     * Upload an audio file
     *
     * @param string $projectId
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function uploadAudioFile($projectId, $tmpFilePath)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        $file = $_FILES["file"];
        $fileName = $file["name"];
        $fileNamePrefix = date("YmdHis");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = false === ($pos = strrpos($fileName, ".")) ? "" : substr($fileName, $pos);

        $allowedTypes = [
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
            "video/webm",
        ];
        $allowedExtensions = [".mp3", ".mpa", ".mpg", ".m4a", ".wav", ".ogg", ".flac", ".webm"];

        $response = new UploadResponse();

        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {
            // make the folders if they don't exist
            $project->createAssetsFolders();
            $folderPath = $project->getAudioFolderPath();

            // move original uploaded/recorded file from tmp location to assets
            $filePath = self::mediaFilePath($folderPath, $fileNamePrefix, $fileName);
            $moveOk = copy($tmpFilePath, $filePath);

            $convertAudio = false;
            $targetFileExtension = ".webm";
            $codecFlag = "";

            // recorded audio and uploaded audio have different settings
            $recordedInBrowser = false;
            if (array_key_exists("recordedInBrowser", $_POST) && $_POST["recordedInBrowser"] === "true") {
                $recordedInBrowser = true;
            }

            if ($recordedInBrowser) {
                // audio recorded with pcm codec is saved in .webm files, which is then converted to .wav files 12-2022
                if (strcmp($project->audioRecordingCodec, "wav") == 0) {
                    $convertAudio = true;
                    $targetFileExtension = ".wav";
                }
            } else {
                // for audio uploaded from a device, NOT recorded in browser

                if (
                    strcmp($project->whenToConvertAudio, "always") == 0 ||
                    (strcmp($project->whenToConvertAudio, "sr") == 0 && // restrictions on send/receive files 12-2022
                        (filesize($filePath) > 1000000 ||
                            (strcmp(strtolower($fileExt), ".mp3") !== 0 &&
                                strcmp(strtolower($fileExt), ".wav") !== 0 &&
                                strcmp(strtolower($fileExt), ".webm") !== 0)))
                ) {
                    $convertAudio = true;
                    $targetFileExtension = ".webm";
                    $codecFlag = "-c:a libopus";
                }
            }

            if ($convertAudio == true) {
                $extensionlessFileName = substr($fileName, 0, strrpos($fileName, strtolower($fileExt)));

                $fileName = $extensionlessFileName . $targetFileExtension; //$fileName ->> the converted file
                `ffmpeg -i $tmpFilePath $codecFlag $fileName 2> /dev/null`; //original file is at the tmpFilePath. convert that file and save it to be $fileName
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
                $data->fileName = $fileNamePrefix . "_" . $fileName; //if the file has been converted, $fileName = converted file
                $data->fileSize = filesize($filePath);
                $response->result = true;

                //If this audio upload is replacing old audio, the previous file(s) for the entry are deleted from the assets
                if (array_key_exists("previousFilename", $_POST)) {
                    $previousFilename = $_POST["previousFilename"];
                    self::deleteMediaFile($projectId, "audio", $previousFilename);
                }
            } else {
                $data = new ErrorResult();
                $data->errorType = "UserMessage";
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            $data = new ErrorResult();
            $data->errorType = "UserMessage";
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
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function uploadImageFile($projectId, $tmpFilePath)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        $file = $_FILES["file"];
        $fileName = $file["name"];
        $fileNamePrefix = date("YmdHis");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = false === ($pos = strrpos($fileName, ".")) ? "" : substr($fileName, $pos);

        $allowedTypes = [
            "image/jpeg",
            "image/jpg",
            // SVG disabled until we can ensure no embedded Javascript; see https://github.com/w3c/svgwg/issues/266
            // "image/svg+xml",
            "image/gif",
            "image/png",
        ];
        $allowedExtensions = [
            ".jpg",
            ".jpeg",
            // ".svg",
            ".gif",
            ".png",
        ];

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
                $data->fileName = $fileNamePrefix . "_" . $fileName;
                $data->fileSize = filesize($filePath);
                $response->result = true;
            } else {
                $data = new ErrorResult();
                $data->errorType = "UserMessage";
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            $data = new ErrorResult();
            $data->errorType = "UserMessage";
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
    public static function deleteMediaFile($projectId, $mediaType, $fileName)
    {
        $response = new UploadResponse();
        $response->result = false;
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        switch ($mediaType) {
            case "audio":
                $folderPath = $project->getAudioFolderPath();
                break;
            case "sense-image":
                $folderPath = $project->getImageFolderPath();
                break;
            default:
                $errorMsg = "Error in function deleteImageFile, unsupported mediaType: $mediaType";
                throw new \Exception($errorMsg);
                $data = new ErrorResult();
                $data->errorType = "Exception";
                $data->errorMessage = $errorMsg;
                return $response;
        }

        //Path to the specific file the entry points to
        $filePath = "$folderPath/$fileName";
        //Put any other stored versions of the file (e.g. the same file saved in other formats) in an array
        $fileNameWithoutExt = preg_replace('/\\.[^.\\s]{3,4}$/', "", $fileName);
        $versionsOfTheSameFile = glob("$folderPath/$fileNameWithoutExt.*");

        if (file_exists($filePath) and !is_dir($filePath)) {
            //Delete the file the entry points to and create the server response
            if (unlink($filePath)) {
                $data = new MediaResult();
                $data->path = $folderPath;
                $data->fileName = $fileName;
                $response->result = true;
            } else {
                $data = new ErrorResult();
                $data->errorType = "UserMessage";
                $data->errorMessage = "$fileName could not be deleted. Contact your Site Administrator.";
            }

            //Delete any other stored versions of the file
            foreach ($versionsOfTheSameFile as $aVersionOfThisFile) {
                if ($aVersionOfThisFile != $filePath) {
                    //because $filePath, the one the entry points to, was already deleted above
                    unlink($aVersionOfThisFile);
                }
            }

            return $response;
        }

        $data = new ErrorResult();
        $data->errorType = "UserMessage";
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
        return $folderPath . DIRECTORY_SEPARATOR . $fileNamePrefix . "_" . $originalFileName;
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
        $cleanupFiles = glob(
            $folderPath . DIRECTORY_SEPARATOR . $fileNamePrefix . "*[" . implode(", ", $allowedExtensions) . "]"
        );
        foreach ($cleanupFiles as $cleanupFile) {
            @unlink($cleanupFile);
        }
    }

    /**
     * Import a project zip file
     *
     * @param string $projectId
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function importProjectZip($projectId, $tmpFilePath)
    {
        $file = $_FILES["file"];
        $fileName = $file["name"];
        $mergeRule = self::extractStringFromArray($_POST, "mergeRule", LiftMergeRule::IMPORT_WINS);
        $skipSameModTime = self::extractBooleanFromArray($_POST, "skipSameModTime");
        $deleteMatchingEntry = self::extractBooleanFromArray($_POST, "deleteMatchingEntry");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = false === ($pos = strrpos($fileName, ".")) ? "" : substr($fileName, $pos);

        $allowedTypes = ["application/zip", "application/octet-stream", "application/x-7z-compressed"];
        $allowedExtensions = [".zip", ".zipx", ".7z"];

        $response = new UploadResponse();
        if (in_array(strtolower($fileType), $allowedTypes) && in_array(strtolower($fileExt), $allowedExtensions)) {
            // make the folders if they don't exist
            $project = new LexProjectModel($projectId);
            $project->createAssetsFolders();
            $folderPath = $project->getAssetsFolderPath();

            // move uploaded file from tmp location to assets
            $filePath = $folderPath . DIRECTORY_SEPARATOR . $fileName;
            $moveOk = copy($tmpFilePath, $filePath);
            @unlink($tmpFilePath);

            // import zip
            if ($moveOk) {
                $importer = LiftImport::get()->importZip(
                    $filePath,
                    $project,
                    $mergeRule,
                    $skipSameModTime,
                    $deleteMatchingEntry
                );
                $project->write();

                $liftFilename = basename($importer->liftFilePath);
                if (!$project->liftFilePath || $mergeRule != LiftMergeRule::IMPORT_LOSES) {
                    // cleanup previous files of any allowed extension
                    $cleanupFiles = glob($folderPath . "/*[" . implode(", ", self::$allowedLiftExtensions) . "]");
                    foreach ($cleanupFiles as $cleanupFile) {
                        @unlink($cleanupFile);
                    }

                    // copy uploaded LIFT file from extract location to assets
                    $filePath = $folderPath . DIRECTORY_SEPARATOR . $liftFilename;
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
                    $data->errorType = "UserMessage";
                    $data->errorMessage = "$liftFilename could not be saved to the right location. Contact your Site Administrator.";
                    $response->result = false;
                }
            } else {
                $data = new ErrorResult();
                $data->errorType = "UserMessage";
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            $data = new ErrorResult();
            $data->errorType = "UserMessage";
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
     * @param string $tmpFilePath
     * @throws \Exception
     * @return UploadResponse
     */
    public static function importLiftFile($projectId, $tmpFilePath)
    {
        $file = $_FILES["file"];
        $fileName = $file["name"];
        $mergeRule = self::extractStringFromArray($_POST, "mergeRule", LiftMergeRule::IMPORT_WINS);
        $skipSameModTime = self::extractBooleanFromArray($_POST, "skipSameModTime");
        $deleteMatchingEntry = self::extractBooleanFromArray($_POST, "deleteMatchingEntry");

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $tmpFilePath);
        finfo_close($finfo);

        $fileName = FileUtilities::replaceSpecialCharacters($fileName);

        $fileExt = false === ($pos = strrpos($fileName, ".")) ? "" : substr($fileName, $pos);
        $allowedTypes = ["text/xml", "application/xml"];

        $response = new UploadResponse();
        if (
            in_array(strtolower($fileType), $allowedTypes) &&
            in_array(strtolower($fileExt), self::$allowedLiftExtensions)
        ) {
            // make the folders if they don't exist
            $project = new LexProjectModel($projectId);
            $project->createAssetsFolders();
            $folderPath = $project->getAssetsFolderPath();

            $importer = LiftImport::get()->merge(
                $tmpFilePath,
                $project,
                $mergeRule,
                $skipSameModTime,
                $deleteMatchingEntry
            );
            $project->write();

            $moveOk = true;
            if (!$project->liftFilePath || $mergeRule != LiftMergeRule::IMPORT_LOSES) {
                // cleanup previous files of any allowed extension
                $cleanupFiles = glob($folderPath . "/*[" . implode(", ", self::$allowedLiftExtensions) . "]");
                foreach ($cleanupFiles as $cleanupFile) {
                    @unlink($cleanupFile);
                }

                // move uploaded LIFT file from tmp location to assets
                $filePath = $folderPath . DIRECTORY_SEPARATOR . $fileName;
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
                $data->errorType = "UserMessage";
                $data->errorMessage = "$fileName could not be saved to the right location. Contact your Site Administrator.";
                $response->result = false;
            }
        } else {
            $allowedExtensionsStr = implode(", ", self::$allowedLiftExtensions);
            $data = new ErrorResult();
            $data->errorType = "UserMessage";
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
                $result = strtolower($array[$key]) == "true";
            }
        }
        return $result;
    }
}
