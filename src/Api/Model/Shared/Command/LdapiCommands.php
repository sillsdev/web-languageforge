<?php

namespace Api\Model\Shared\Command;

use Api\Service\Ldapi;

class LdapiCommands
{
    const USERS_BASE_URL = 'users';
    const SEARCHUSERS_BASE_URL = 'searchUsers';
    const PROJECTS_BASE_URL = 'projects';
    const SEARCHPROJECTS_BASE_URL = 'searchProjects';
    const ROLES_BASE_URL = 'roles';

    const URL_PART_GET_ALL = '';
    const URL_PART_POST_ONE = '';
    const URL_PART_GET_PROJECTS = 'projects';

    const URL_VERIFY_PASSWORD = 'verify-password';

    public static function getAllUsers() {
        return Ldapi::call('get', self::USERS_BASE_URL . self::URL_PART_GET_ALL);
    }

    public static function searchUsers(string $searchText) {
        return Ldapi::call('get', self::SEARCHUSERS_BASE_URL . '/' . $searchText);
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

    public static function getProjectsForUser(string $username) {
        return Ldapi::call('get', self::USERS_BASE_URL . '/' . $username . '/' . self::URL_PART_GET_PROJECTS);
    }

    public static function updateUserRoleInProject(string $projectCode, string $username, string $role) {
        $addRequest = ['username' => $username, 'role' => $role];
        // API wants an array of requests even if there is only one request
        $apiParams = ['add' => [$addRequest]];
        return Ldapi::call('patch', self::PROJECTS_BASE_URL . '/' . $projectCode, $apiParams);
    }

    public static function removeUserFromProject(string $projectCode, string $username) {
        $apiParams = ['removeUser' => $username];
        return Ldapi::call('patch', self::PROJECTS_BASE_URL . '/' . $projectCode, $apiParams);
    }

    public static function isUserManagerOfProject(string $username, string $projectCode) {
        return Ldapi::call('get', self::USERS_BASE_URL . '/' . $username . '/isManagerOfProject/' . $projectCode);
    }

    public static function getAllRoles() {
        return Ldapi::call('get', self::ROLES_BASE_URL . self::URL_PART_GET_ALL);
    }
}

?>
