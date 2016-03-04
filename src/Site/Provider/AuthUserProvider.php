<?php

namespace Site\Provider;

use Api\Library\Shared\Website;
use Api\Model\Command\UserCommands;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModelWithPassword;
use Site\Model\UserWithId;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
Use Symfony\Component\Security\Core\User\UserInterface;

class AuthUserProvider implements UserProviderInterface
{
    public function __construct(Website $website = null) {
        $this->website = $website;
    }

    /**
     * @var Website
     */
    private $website;

    public function loadUserByUsername($usernameOrEmail) {

        $user = new UserModelWithPassword();

        // try to load user by email address
        if (strpos($usernameOrEmail, '@') !== false) {
            $user->readByEmail($usernameOrEmail);
        } else {
            $user->readByUserName($usernameOrEmail);
        }

        if ($user->id->asString() == '') {
            throw new UsernameNotFoundException(sprintf('Username "%s" does not exist.', $usernameOrEmail));
        }
        if (!$user->hasRoleOnSite($this->website) and $user->role != SystemRoles::SYSTEM_ADMIN) {
            throw new AccessDeniedException(sprintf('Username "%s" not available on "%s". Use "Create an Account".', $usernameOrEmail, $this->website->domain));
        }

        /*
        $identityCheck = UserCommands::checkIdentity($usernameOrEmail, '', $this->website);
        if (! $identityCheck->usernameExists) {
            throw new UsernameNotFoundException(sprintf('Username "%s" does not exist.', $usernameOrEmail));
        }

        $user->readByUserName($usernameOrEmail);

        if (! $identityCheck->usernameExistsOnThisSite and $user->role != SystemRoles::SYSTEM_ADMIN) {
            throw new AccessDeniedException(sprintf('Username "%s" not available on "%s". Use "Create an Account".', $usernameOrEmail, $this->website->domain));
        }
        */

        $roles = array('ROLE_'.$user->role);
        if ($user->siteRole and
            $user->siteRole->offsetExists($this->website->domain) and
            $user->siteRole[$this->website->domain] !== SiteRoles::NONE) {
            $roles[] = 'ROLE_SITE_'.$user->siteRole[$this->website->domain];
        }

        return new UserWithId($user->username, $user->password, $user->id->asString(), $roles);
    }

    public function refreshUser(UserInterface $user) {
        if (! $user instanceof UserWithId) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        return $this->loadUserByUsername($user->getUsername());
    }

    public function supportsClass($class) {
        return $class === 'Site\Model\UserWithId';
    }
}
