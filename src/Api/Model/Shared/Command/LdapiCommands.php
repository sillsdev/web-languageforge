<?php

namespace Api\Model\Shared\Command;

use Api\Service\Ldapi;

class LdapiCommands
{
    const USERS_BASE_URL = 'users';
    const PROJECTS_BASE_URL = 'projects';
    const ROLES_BASE_URL = 'roles';

    const URL_PART_GET_ALL = '';
    const URL_PART_POST_ONE = '';

    const URL_VERIFY_PASSWORD = 'verify-password';

    public static function getAllUsers() {
        return Ldapi::call('get', self::USERS_BASE_URL . self::URL_PART_GET_ALL);
    }

    public static function getAllProjects() {
        return Ldapi::call('get', self::PROJECTS_BASE_URL . self::URL_PART_GET_ALL);
    }

    public static function getUser(string $username) {
        return Ldapi::call('get', self::USERS_BASE_URL . '/' . $username);
    }

    public static function updateUser(string $username, Array $userdetails) {
        return Ldapi::call('put', self::USERS_BASE_URL . '/' . $username, $userdetails);
    }

    public static function checkUserPassword(string $username, string $password) {
        $loginData = ['username' => $username, 'password' => $password];
        return Ldapi::call('post', self::URL_VERIFY_PASSWORD, $loginData);
    }

    public static function getProject(string $projectCode) {
        return Ldapi::call('get', self::PROJECTS_BASE_URL . '/' . $projectCode);
    }

    public static function getAllRoles() {
        return Ldapi::call('get', self::ROLES_BASE_URL . self::URL_PART_GET_ALL);
    }
}

?>
