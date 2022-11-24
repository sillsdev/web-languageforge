<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Shared\UserModel;

class UserProfileDto
{
    /**
     *
     * @param string $userId
     * @returns array - the DTO array
     */
    public static function encode($userId)
    {
        $dto = [];

        $userModel = new UserModel($userId);
        $userProfile = UserProfileEncoder::encode($userModel);
        $dto["projectsSettings"] = $userProfile["projects"];

        unset($userProfile["projects"]);
        $dto["userProfile"] = $userProfile;

        return $dto;
    }
}
