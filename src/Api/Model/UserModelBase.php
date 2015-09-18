<?php

namespace Api\Model;

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\MapOf;

class UserModelBase extends Mapper\MapperModel
{

    const COMMUNICATE_VIA_SMS   = 'sms';
    const COMMUNICATE_VIA_EMAIL = 'email';
    const COMMUNICATE_VIA_BOTH  = 'both';

    public function __construct($id = '')
    {
        $this->id = new Id();
        $this->siteRole = new MapOf();
        $this->validationExpirationDate = new \DateTime();
        $this->resetPasswordExpirationDate = new \DateTime();
//         $this->setReadOnlyProp('role');    // TODO Enhance. This currently causes API tests to fail but should be in for security. IJH 2014-03
        parent::__construct(UserModelMongoMapper::instance(), $id);
    }

    /**
     *    Removes a user from the collection
     *  Project references to this user are also removed
     */
    public function remove()
    {
        UserModelMongoMapper::instance()->remove($this->id->asString());
    }

    public function read($id)
    {
        parent::read($id);
        if (!$this->communicate_via) {
            $this->communicate_via = self::COMMUNICATE_VIA_EMAIL;
        }
        if (!$this->avatar_ref) {
            $default_avatar = "anonymoose.png";
            $this->avatar_ref = $default_avatar;
        }
    }

    /**
     *
     * @param string $username
     * @return boolean - true if the username exists, false otherwise
     */
    public function readByUserName($username)
    {
        return $this->readByProperty('username', $username);
    }

    /**
     * Returns true if the current user has $right to $website.
     * @param int $right
     * @param Website $website
     * @return bool
     */
    public function hasRight($right, $website)
    {
        $result = SiteRoles::hasRight($this->siteRole, $right) ||
                SystemRoles::hasRight($this->role, $right);

        return $result;
    }

    /**
     *
     * @param Website $website
     * @return array:
     */
    public function getRightsArray($website)
    {
        $siteRightsArray = SiteRoles::getRightsArray($this->siteRole, $website);
        $systemRightsArray = SystemRoles::getRightsArray($this->role);
        $mergeArray = array_merge($siteRightsArray, $systemRightsArray);

        return (array_values(array_unique($mergeArray)));
    }

    /**
     * Returns whether the user has a role on the requested website
     * @param Website $website
     * @return bool true if the user has any role on the website, otherwise false
     */
    public function hasRoleOnSite($website)
    {
        return $this->siteRole->offsetExists($website->domain);
    }

    /**
     *
     * @param bool $consumeKey - if true the validationKey will be destroyed upon validate()
     * @return boolean
     */
    public function validate($consumeKey = true)
    {
        if ($this->validationKey) {
            $today = new \DateTime();
            $interval = $today->diff($this->validationExpirationDate);

            if ($consumeKey) {
                $this->validationKey = '';
                $this->validationExpirationDate = new \DateTime();
            }

            if ($this->emailPending) {
                $this->email = $this->emailPending;
                $this->emailPending = '';
            }

            $intervalSeconds = ($interval->d * 86400) + ($interval->h * 3600) + ($interval->m * 60) + $interval->s;
            if ($intervalSeconds > 0 && $interval->invert == 0) {
                return true;
            }
        }

        return false;
    }

    /**
     *
     * @param int $days
     * @return string - validation key
     */
    public function setValidation($days)
    {
        $this->validationKey = sha1(microtime(true).mt_rand(10000,90000));
        $today = new \DateTime();
        $this->validationExpirationDate = $today->add(new \DateInterval("P${days}D"));

        return $this->validationKey;
    }

    /**
     *
     * @param bool $consumeKey - if true the resetPasswordKey will be destroyed upon validate()
     * @return boolean
     */
    public function hasForgottenPassword($consumeKey = true)
    {
        if ($this->resetPasswordKey) {
            $today = new \DateTime();
            $interval = $today->diff($this->resetPasswordExpirationDate);

            if ($consumeKey) {
                $this->resetPasswordKey = '';
                $this->resetPasswordExpirationDate = new \DateTime();
            }

            $intervalSeconds = ($interval->d * 86400) + ($interval->h * 3600) + ($interval->m * 60) + $interval->s;
            if ($intervalSeconds > 0 && $interval->invert == 0) {
                return true;
            }
        }

        return false;
    }

    /**
     *
     * @param int $days
     * @return string - reset password key
     */
    public function setForgotPassword($days)
    {
        $this->resetPasswordKey = sha1(microtime(true).mt_rand(10000,90000));
        $today = new \DateTime();
        $this->resetPasswordExpirationDate = $today->add(new \DateInterval("P${days}D"));

        return $this->resetPasswordKey;
    }

    /**
     * @var IdReference
     */
    public $id;

    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $username;

    public $avatar_ref;

    /**
     *
     * @var string
     * An unconfirmed email address for this user
     */
    public $emailPending;

    /**
     * @var string
     */
    public $email;

    /**
     * @var string
     */
    public $validationKey;

    /**
     * @var \DateTime
     */
    public $validationExpirationDate;

    /**
     * @var string
     */
    public $resetPasswordKey;

    /**
     * @var \DateTime
     */
    public $resetPasswordExpirationDate;

    /**
     * @var string
     * @see Roles
     * Note: this is system role
     */
    public $role;

    //public $groups;

    /**
     * @var bool
     */
    public $active;

    /**
     * @var string - possible values are "email", "sms" or "both"
     */
    public $communicate_via;

    /**
     * @var MapOf<string>
     */
    public $siteRole;
}
