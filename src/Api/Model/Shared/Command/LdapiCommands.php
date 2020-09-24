<?php

namespace Api\Model\Shared\Command;

use Api\Service\Ldapi;

class LdapiCommands
{
    const USERS_BASE_URL = 'users';
    const PROJECTS_BASE_URL = 'projects';

    const URL_PART_GET_ALL = '';
    const URL_PART_POST_ONE = '';

    const URL_VERIFY_PASSWORD = 'verify-password';

    public static function get_all_users() {
        return Ldapi::call('get', self::USERS_BASE_URL . self::URL_PART_GET_ALL);
    }

    public static function get_all_projects() {
        return Ldapi::call('get', self::PROJECTS_BASE_URL . self::URL_PART_GET_ALL);
    }

    public static function check_user_password(string $username, string $password) {
        $loginData = ['username' => $username, 'password' => $password];
        return Ldapi::call('post', self::URL_VERIFY_PASSWORD, $loginData);
    }
}

?>
