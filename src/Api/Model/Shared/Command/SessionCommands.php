<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\HelpContentCommands;
use Api\Library\Shared\Website;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

class SessionCommands
{
    /**
     * @param string $projectId
     * @param string $userId
     * @param Website $website
     * @param string $appName - refers to the application being used by the user
     * @return array
     */
    public static function getSessionData($projectId, $userId, $website, $appName = '', $mockFilename = null)
    {
        $sessionData = array();
        $sessionData['baseSite'] = $website->base;

        $sessionData['isProduction'] = $website->isProduction;

        if ($userId) {
            $sessionData['userId'] = (string) $userId;
            $user = new UserModel($userId);
            $sessionData['userSiteRights'] = $user->getRightsArray($website);
            $sessionData['username'] = $user->username;
        }

        if ($projectId) {
            $project = ProjectModel::getById($projectId);
            if (array_key_exists($userId, $project->users)) {
                $sessionData['project'] = array();
                $sessionData['project']['id'] = (string) $projectId;
                $sessionData['project']['projectName'] = $project->projectName;
                if ($project->isArchived) {
                    $sessionData['project']['projectName'] .= " [ARCHIVED]";
                }
                $sessionData['project']['appName'] = $project->appName;
                $sessionData['project']['appLink'] = "/app/{$project->appName}/$projectId/";
                $sessionData['project']['ownerRef'] = $project->ownerRef->asString();
                $sessionData['project']['userIsProjectOwner'] = $project->isOwner($userId);
                $sessionData['project']['slug'] = $project->databaseName();
                $sessionData['project']['isArchived'] = $project->isArchived;
                $sessionData['userProjectRights'] = $project->getRightsArray($userId);
                $sessionData['projectSettings'] = $project->getPublicSettings($userId);
            }
        }

        if ($appName) {
            $sessionData['helps'] = HelpContentCommands::getSessionData($appName, $website);
        }

        // File Size
        $postMax = self::fromValueWithSuffix(ini_get("post_max_size"));
        $uploadMax = self::fromValueWithSuffix(ini_get("upload_max_filesize"));
        $fileSizeMax = min(array($postMax, $uploadMax));
        $sessionData['fileSizeMax'] = $fileSizeMax;

        //return JsonEncoder::encode($sessionData);  // This is handled elsewhere
        self::write($sessionData, $mockFilename);
        
        return $sessionData;
    }

    public static function getSessionFilePath($mockFilename = null)
    {
        $sessionId = session_id();
        if(!is_null($mockFilename)){
            $sessionId = $mockFilename;
        }
        if($sessionId == ""){
            return false;
        }
        
        return sys_get_temp_dir() . DIRECTORY_SEPARATOR . $sessionId;
    }

    private static function write($data, $mockFilename = null)
    {
        $jsonData = json_encode($data);
        //May pose a possible security risk to save with ID as filename.
        
        $filePath = self::getSessionFilePath($mockFilename);
        if(!$filePath){
            return false;
        }
        $isWritten = file_put_contents($filePath, $jsonData);
        // $SessionFile = fopen($filePath, "w") or die("Unable to open file!");
        // $isWritten = fwrite($SessionFile, $jsonData, strlen($jsonData));
        // fclose($SessionFile);
        
        if($isWritten){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Convert a human-readable size value (5M, 1G) into bytes
     * @param string $val
     * @return int
     */
    private static function fromValueWithSuffix($val)
    {
        $val = trim($val);
        $result = (int) $val;
        $last = strtolower($val[strlen($val)-1]);
        switch ($last) {
            // The 'G' modifier is available since PHP 5.1.0
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'g':
                $result *= 1024;
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'm':
                $result *= 1024;
            case 'k':
                $result *= 1024;
        }

        return $result;
    }

}
