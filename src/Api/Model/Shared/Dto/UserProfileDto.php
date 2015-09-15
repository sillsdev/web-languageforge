<?php

namespace Api\Model\Shared\Dto;

use Api\Model\UserProfileModel;

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
        $dto = array();

        $userProfileModel = new UserProfileModel($userId);
        $userProfile = UserProfileEncoder::encodeModel($userProfileModel, $website);
        $dto['projectsSettings'] = $userProfile['projects'];

        unset($userProfile['projects']);
        $dto['userProfile'] = $userProfile;

        return $dto;
    }
}
