<?php

namespace Site\Provider;

use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
use Site\Model\UserWithId;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Api\Library\Shared\UrlHelper;

class AuthUserProvider implements UserProviderInterface
{
    /**
     * @param string $usernameOrEmail
     * @return UserWithId
     */
    public function loadUserByUsername($usernameOrEmail)
    {
        $user = new UserModelWithPassword();
        $user->readByUsernameOrEmail($usernameOrEmail);

        if ($user->id->asString() == "") {
            throw new UsernameNotFoundException();
        }
        if (!$user->active) {
            // TODO: Get this error msg to propogate to Auth::setupAuthView
            throw new UsernameNotFoundException(sprintf('Access denied for username "%s".', $usernameOrEmail));
        }
        $roles = AuthUserProvider::getSiteRoles($user);

        return new UserWithId($user->username, $user->password, $user->id->asString(), $roles);
    }

    /**
     * @param UserInterface $user
     * @return UserInterface $user
     */
    public function refreshUser(UserInterface $user)
    {
        if (!$user instanceof UserWithId) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        return $this->loadUserByUsername($user->getUsername());
    }

    public function supportsClass($class)
    {
        return $class === "Site\Model\UserWithId";
    }

    public static function getSiteRoles(UserModel $user)
    {
        $roles = ["ROLE_" . $user->role];
        $hostname = UrlHelper::getHostname();
        if (
            $user->siteRole and
            $user->siteRole->offsetExists($hostname) and
            $user->siteRole[$hostname] !== SiteRoles::NONE
        ) {
            $roles[] = "ROLE_SITE_" . $user->siteRole[$hostname];
        }
        return $roles;
    }
}
