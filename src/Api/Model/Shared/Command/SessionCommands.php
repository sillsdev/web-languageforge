<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\Website;
use Api\Library\Shared\JWTToken;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

class SessionCommands
{
    /**
     * @param string $projectId
     * @param string $userId
     * @param Website $website
     * @param string $mockFilename
     * @return array
     * @throws \Exception
     */
    public static function getSessionData($projectId, $userId, $website, $mockFilename = null)
    {
        $sessionData = array();
        $sessionData['baseSite'] = $website->base;

        // VERSION is not defined when running tests
        if (defined('VERSION')) {
            $sessionData['version'] = VERSION;
        }

        // ensure interfaceConfig if user is not logged in
        // (LF only at this stage, SF using Transifex default language picker) - IJH 2018-06
        if ($website->base == Website::LANGUAGEFORGE) {
            $sessionData['projectSettings'] = [
                'interfaceConfig' => [
                    'languageCode' => 'en',
                    'selectLanguages' => [
                        'options' => [
                            'en' => [
                                'name' => 'English',
                                'option' => 'English'
                            ]
                        ],
                        'optionsOrder' => ['en']
                    ]
                ]
            ];
        }

        if ($userId) {
            $sessionData['userId'] = (string) $userId;
            $user = new UserModel($userId);
            $sessionData['userSiteRights'] = $user->getRightsArray($website);
            $sessionData['username'] = $user->username;
        }

        if ($projectId && ProjectModel::projectExistsOnWebsite($projectId, $website)) {
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
                $sessionData['project']['interfaceLanguageCode'] = $project->interfaceLanguageCode;
                $sessionData['userProjectRights'] = $project->getRightsArray($userId);
                $sessionData['projectSettings'] = $project->getPublicSettings($userId);
            }
        }

        // File Size
        $postMax = self::fromValueWithSuffix(ini_get("post_max_size"));
        $uploadMax = self::fromValueWithSuffix(ini_get("upload_max_filesize"));
        $fileSizeMax = min(array($postMax, $uploadMax));
        $sessionData['fileSizeMax'] = $fileSizeMax;

        $sessionData['accessToken'] = JWTToken::getAccessToken(720, $userId, $website);

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

        return self::getSessionDirectory($mockFilename) . DIRECTORY_SEPARATOR . $sessionId . ".json";
    }

    private static function getSessionDirectory($mockFilename = null)
    {
        if(is_null($mockFilename)) {
            $subdir = "jsonSessionData";
        } else {
            $subdir = "jsonSessionData4tests";
        }

        return sys_get_temp_dir() . DIRECTORY_SEPARATOR . $subdir;
    }

    private static function write($data, $mockFilename = null)
    {
        $jsonData = json_encode($data);

        if(!file_exists(self::getSessionDirectory($mockFilename))){
            mkdir(self::getSessionDirectory($mockFilename));
        }

        //May pose a possible security risk to save with ID as filename.
        $filePath = self::getSessionFilePath($mockFilename);
        if(!$filePath){
            return false;
        }
        $isWritten = file_put_contents($filePath, $jsonData);

        return $isWritten !== false;
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
