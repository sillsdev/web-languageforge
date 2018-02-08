<?php

namespace Site\OAuth;

use Site\Controller\ResourceOwnerInterfaceWithMoreDetails;

class ParatextUser implements ResourceOwnerInterfaceWithMoreDetails
{
    /**
     * @var array
     */
    protected $details;

    /**
     * @param array $details
     */
    public function __construct(array $details)
    {
        $this->details = $details;
    }

    /**
     * Returns the identifier of the authorized resource owner.
     *
     * @return mixed
     */
    public function getId()
    {
        return $this->details['sub'];
    }

    /**
     * Return all of the owner details available as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->details;
    }

    public function getName()
    {
        return $this->details['username'];
    }

    public function getIsPtApproved() : bool
    {
        if (isset($this->details['pt_approved'])) {
            return (bool)$this->details['pt_approved'];
        } else {
            return false;
        }
    }

    public function getPrimaryOrgId()
    {
        return $this->details['primary_org_id'];
    }

    public function getEmail()
    {
        if (isset($this->details['email'])) {
            return $this->details['email'];
        } else {
            return null;
        }
    }

    public function getIsEmailVerified() : bool
    {
        if (isset($this->details['email_verified'])) {
            return (bool)$this->details['email_verified'];
        } else {
            return false;
        }
    }

    public function getAvatar()
    {
        if (isset($this->details['picture'])) {
            return $this->details['picture'];
        } else {
            return null;
        }
    }

    public static function createFromIdToken(string $idToken)
    {
        $jwt_parts = explode(".", $idToken);
        if (isset($jwt_parts[1])) {
            $json_details = base64_decode($jwt_parts[1]);
            $id_details = json_decode($json_details, true);
            return new ParatextUser($id_details);
        } else {
            return null;
        }
    }
}
