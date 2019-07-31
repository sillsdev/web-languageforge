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
     * @param ProjectModel $model in order to pass to MongoMapper->readByProperty()
     */
    public function generateNewAuthToken($model, $testMode = false)
    {
        // Generate a new key that does not exist in the DB
        do
        {
            $newToken = bin2hex(random_bytes(6));
        } while ($model->readByProperty('inviteLink.authToken', $newToken));


        $this->authToken = $newToken;

        return $newToken;
    }

    public function setDefaultRole($newRole)
    {
        $validRoles = LexRoles::getRolesList();
        if (in_array($newRole, $validRoles)) {
            $this->defaultRole = $newRole;
        } else {
            throw new InvalidArgumentException("An invite link tried to set an invalid role");
        }
    }
}
