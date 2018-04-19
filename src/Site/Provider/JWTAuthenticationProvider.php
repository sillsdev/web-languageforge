<?php

namespace Site\Provider;

use Api\Library\Shared\JWTToken;
use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use Site\Model\UserWithId;
use Site\OAuth\JWTSilexToken;
use Symfony\Component\Security\Core\Authentication\Provider\AuthenticationProviderInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class JWTAuthenticationProvider implements AuthenticationProviderInterface
{
    protected $website;

    public function __construct(Website $website)
    {
        $this->website = $website;
    }

    /**
     * Attempts to authenticate a TokenInterface object.
     *
     * @param TokenInterface $token The TokenInterface instance to authenticate
     *
     * @return TokenInterface An authenticated TokenInterface instance, never null
     *
     * @throws AuthenticationException if the authentication fails
     */
    public function authenticate(TokenInterface $token)
    {
        $username = JWTToken::getUsernameFromToken($token, $this->website);
        $userModel = new UserModel();
        $userModel->readByUserName($username);
        if (is_null($userModel->username)) {
            // At this point we should have a valid username
            throw new AuthenticationException("Invalid username");
        }

        // Success: return authenticated token
        $roles = AuthUserProvider::getSiteRoles($userModel, $this->website);
        $userWithId = new UserWithId($username, '', $username, $roles);
        return new JWTSilexToken($userWithId, $token->getCredentials(), 'site', $userWithId->getRoles());  // TODO: Figure out what Silex expects us to handle provider keys
    }

    /**
     * Checks whether this provider supports the given token.
     *
     * @param TokenInterface $token A TokenInterface instance
     *
     * @return bool true if the implementation supports the Token, false otherwise
     */
    public function supports(TokenInterface $token)
    {
        return $token instanceof JWTSilexToken;
    }
}
