<?php

namespace Site\Model;

use Symfony\Component\Security\Core\User\UserInterface;

class UserWithId implements UserInterface
{
    public function __construct($username, $password, $id, array $roles = [])
    {
        if ("" === $username || null === $username) {
            throw new \InvalidArgumentException("The username cannot be empty.");
        }

        $this->username = $username;
        $this->password = $password;
        $this->id = $id;
        $this->roles = $roles;
    }

    /** @var string */
    private $username;

    /** @var string */
    private $password;

    /** @var string */
    private $id;

    /** @var array */
    private $roles;

    public function getRoles()
    {
        return $this->roles;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getSalt()
    {
    }

    public function getUserId()
    {
        return $this->id;
    }
    public function getUsername()
    {
        return $this->username;
    }

    public function eraseCredentials()
    {
    }
}
