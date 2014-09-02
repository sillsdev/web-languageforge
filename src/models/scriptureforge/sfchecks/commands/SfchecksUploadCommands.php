<?php
namespace models\scriptureforge\sfchecks\commands;

use models\scriptureforge\SfchecksProjectModel;
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
        // $project = new SfchecksProjectModel($projectId);
        if ($uploadType != 'audio') {
            return false;
        }
        
        $file = $_FILES['file'];
        $fileType = $file['type'];
        $fileName = $file['name'];
        
        // replace special characters with _
        $fileName = str_replace(array(
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
        ), '_', $fileName);
        $fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);
        
        // allowed types: documented, observed
        $allowedTypes = array(
            "audio/mpeg",
            "audio/mp3"
        );
        $allowedExtensions = array(
            ".mp3"
        );
        
        $textId = $_POST['textId'];
        if (in_array($fileType, $allowedTypes) && in_array($fileExt, $allowedExtensions)) {
            
            // make the folder if it doesn't exist
            $folderPath =  APPPATH . 'assets/' . $projectId;
            if (! file_exists($folderPath) and ! is_dir($folderPath)) {
                mkdir($folderPath);
            }
            
            // cleanup previous files of any allowed extension
            $cleanupFiles = glob($folderPath . '/' . $textId . '*[' . implode(', ', $allowedExtensions) . ']');
            foreach ($cleanupFiles as $cleanupFile) {
                @unlink($cleanupFile);
            }
            
            // move uploaded file from tmp location to assets
            $filePath = $folderPath . '/' . $textId . '_' . $fileName;
            $moveOk = move_uploaded_file($file['tmp_name'], $filePath);
            
            // update database with file location
            $project = new ProjectModel($projectId);
            $text = new TextModel($project, $textId);
            if ($moveOk) {
                $text->audioUrl = $filePath;
            } else {
                $text->audioUrl = '';
            }
            $text->write();
            
            return "File uploaded successfully.";
        } else {
            $allowedExtensionsStr = implode(", ", $allowedExtensions);
            // Ummm ditch the echos below and make them part of the result structure.
            if (count($allowedExtensions) < 1) {
                return "$fileName is not an allowed audio file. No audio file formats are currently enabled.";
            } elseif (count($allowedExtensions) == 1) {
                return "$fileName is not an allowed audio file. Ensure the file is an $allowedExtensionsStr.";
            } else {
                return "$fileName is not an allowed audio file. Ensure the file is one of the following types: $allowedExtensionsStr.";
            }
        }
    }
}

?>
