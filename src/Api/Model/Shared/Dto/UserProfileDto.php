<?php

namespace Api\Model\Shared\Dto;

use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;

class UserProfileDto
{
    /**
     *
     * @param string $userId
     * @param Website $website
     * @returns array - the DTO array
     */
    public static function encode($userId, $website)
    {
        $dto = [];

        $userModel = new UserModel($userId);
        $userProfile = UserProfileEncoder::encodeModel($userModel, $website);
        $dto["projectsSettings"] = $userProfile["projects"];

        unset($userProfile["projects"]);
        $dto["userProfile"] = $userProfile;

        return $dto;
    }
}
