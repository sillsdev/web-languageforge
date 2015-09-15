<?php

namespace Site\Provider;

use Api\Library\Shared\Website;
use Api\Model\Command\UserCommands;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModelWithPassword;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
Use Symfony\Component\Security\Core\User\UserInterface;
Use Symfony\Component\Security\Core\User\User;

class AuthUserProvider implements UserProviderInterface
{
    public function __construct(Website $website = null) {
        $this->website = $website;
    }

    /**
     * @var Website
     */
    private $website;

    public function loadUserByUsername($username) {
        $identityCheck = UserCommands::checkIdentity($username, '', $this->website);
        if (! $identityCheck->usernameExists) {
            throw new UsernameNotFoundException(sprintf('Username "%s" does not exist.', $username));
        }

        $user = new UserModelWithPassword();
        $user->readByUserName($username);

        if (! $identityCheck->usernameExistsOnThisSite and $user->role != SystemRoles::SYSTEM_ADMIN) {
            throw new AccessDeniedException(sprintf('Username "%s" not available on "%s". Use "Create an Account".', $username, $this->website->domain));
        }

        $roles = array('ROLE_'.$user->role);
        if ($user->siteRole and
            $user->siteRole->offsetExists($this->website->domain) and
            $user->siteRole[$this->website->domain] !== SiteRoles::NONE) {
            $roles[] = 'ROLE_SITE_'.$user->siteRole[$this->website->domain];
        }

        return new User($user->username, $user->password, $roles, $user->active, true, true, true);
    }

    public function refreshUser(UserInterface $user) {
        if (! $user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        return $this->loadUserByUsername($user->getUsername());
    }

    public function supportsClass($class) {
        return $class === 'Symfony\Component\Security\Core\User\User';
    }
}
