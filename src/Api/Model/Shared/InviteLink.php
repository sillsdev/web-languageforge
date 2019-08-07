<?php

namespace Api\Model\Shared;

use Api\Model\Languageforge\Lexicon\LexRoles;

class InviteLink
{

    public function __construct() {

    }

    /** @var string */
    public $authToken;

    /** @var LexRole */
    public $defaultRole;

    /** @var boolean */
    public $isEnabled;

    /**
     * @param ProjectModel $model in order to call to MongoMapper->readByProperty()
     * @return string the invite token stored in the db for the project
     */
    public function generateNewAuthToken($model, $testMode = false)
    {
        // Generate a new key that does not exist in the DB


        $this->authToken = uniqid();

        return $newToken;
    }

    /**
     * @param string $newRole role to set users joining the project via the link to
     * @throws InvalidArgumentException
     */
    public function setDefaultRole($newRole)
    {
        $validRoles = LexRoles::getRolesList(); // Andrew: Do I want only LexRoles though??
        if (in_array($newRole, $validRoles)) {
            $this->defaultRole = $newRole;
        } else {
            throw new InvalidArgumentException("An invite link tried to set a nonexistent role");
        }
    }
}
