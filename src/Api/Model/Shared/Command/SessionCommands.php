<?php

namespace Api\Model\Shared\Command;

use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

class SessionCommands
{
    /**
     * @param string $projectId
     * @param string $userId
     * @param string $mockFilename
     * @return array
     * @throws \Exception
     */
    public static function getSessionData($projectId, $userId, $mockFilename = null)
    {
        $sessionData = [];

        // VERSION is not defined when running tests
        if (defined("VERSION")) {
            $sessionData["version"] = VERSION;
        }

        $sessionData["projectSettings"] = [
            "interfaceConfig" => [
                "languageCode" => "en",
                "selectLanguages" => [
                    "options" => [
                        "en" => [
                            "name" => "English",
                            "option" => "English",
                        ],
                    ],
                    "optionsOrder" => ["en"],
                ],
            ],
        ];

        if ($userId) {
            $sessionData["userId"] = (string) $userId;
            $user = new UserModel($userId);
            $sessionData["userSiteRights"] = $user->getRightsArray();
            $sessionData["username"] = $user->username;
        }

        if ($projectId) {
            $project = ProjectModel::getById($projectId);
            if (array_key_exists($userId, $project->users)) {
                $sessionData["project"] = [];
                $sessionData["project"]["id"] = (string) $projectId;
                $sessionData["project"]["projectName"] = $project->projectName;
                $sessionData["project"]["projectCode"] = $project->projectCode;
                if ($project->isArchived) {
                    $sessionData["project"]["projectName"] .= " [ARCHIVED]";
                }
                $sessionData["project"]["appName"] = $project->appName;
                $sessionData["project"]["appLink"] = "/app/{$project->appName}/$projectId/";

                $ownerUserModel = new UserModel($project->ownerRef->asString());
                $sessionData["project"]["ownerRef"] = [];
                $sessionData["project"]["ownerRef"]["id"] = $ownerUserModel->id->asString();
                $sessionData["project"]["ownerRef"]["username"] = $ownerUserModel->username;

                $sessionData["project"]["userIsProjectOwner"] = $project->isOwner($userId);
                $sessionData["project"]["allowSharing"] = $project->allowSharing;
                $sessionData["project"]["slug"] = $project->databaseName();
                $sessionData["project"]["isArchived"] = $project->isArchived;
                $sessionData["project"]["interfaceLanguageCode"] = $project->interfaceLanguageCode;
                $sessionData["project"]["inviteToken"]["token"] = $project->inviteToken->token;
                $sessionData["project"]["inviteToken"]["defaultRole"] = $project->inviteToken->defaultRole;
                $sessionData["userProjectRights"] = $project->getRightsArray($userId);
                $sessionData["userProjectRole"] = $project->users[$userId]->role;
                $sessionData["userIsProjectMember"] = $project->userIsMember($userId);
                $sessionData["projectSettings"] = $project->getPublicSettings($userId);
            }
        }

        // File Size
        $postMax = self::fromValueWithSuffix(ini_get("post_max_size"));
        $uploadMax = self::fromValueWithSuffix(ini_get("upload_max_filesize"));
        $fileSizeMax = min([$postMax, $uploadMax]);
        $sessionData["fileSizeMax"] = $fileSizeMax;

        return $sessionData;
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
        $last = strtolower($val[strlen($val) - 1]);
        switch ($last) {
            // The 'G' modifier is available since PHP 5.1.0
            /** @noinspection PhpMissingBreakStatementInspection */
            case "g":
                $result *= 1024;
            /** @noinspection PhpMissingBreakStatementInspection */
            case "m":
                $result *= 1024;
            case "k":
                $result *= 1024;
        }

        return $result;
    }
}
