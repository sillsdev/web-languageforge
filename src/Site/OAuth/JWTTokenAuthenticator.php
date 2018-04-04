<?php

namespace Site\OAuth;

use Api\Library\Shared\JWTToken;
use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use Site\Model\UserWithId;
use Site\Provider\AuthUserProvider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;

class JWTTokenAuthenticator implements SimplePreAuthenticatorInterface, AuthenticationFailureHandlerInterface
{
    /**
     * @var Website $website;
     */
    protected $website;

    /**
     * @var TokenStorageInterface $tokenStorage
     */
    protected $tokenStorage;

    public function __construct(Website $website, TokenStorageInterface $tokenStorage)
    {
        $this->website = $website;
        $this->tokenStorage = $tokenStorage;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        $jwtToken = $token->getCredentials();

        $username = JWTToken::getUsernameFromToken($jwtToken, $this->website);
        if ($username === null) {
            throw new BadCredentialsException();  // If we reach this point with an invalid token, that *should* return an error
        }

        // Success: set auth token so that rest of site will treat us as logged in
        $userWithId = $userProvider->loadUserByUsername($username);
        return new JWTSilexToken($userWithId, $token, $providerKey, $userWithId->getRoles());
    }

    public function supportsToken(TokenInterface $token, $providerKey)
    {
        return $token instanceof JWTSilexToken && $token->getProviderKey() === $providerKey;
    }

    public function createToken(Request $request, $providerKey)
    {
        if (!$authHeader = $request->headers->get('Authorization')) {
            return null;
        }

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            return null;
        }

        // Invalid tokens shouldn't cause auth to fail completely, just cause it to proceed to login page
        $username = JWTToken::getUsernameFromToken($token, $this->website);
        if ($username === null) {
            return null;
        }

        return new JWTSilexToken('anon.', $token, $providerKey);  // Not authenticated yet; that's handled in authenticateToken()
    }

    /**
     * This is called when an interactive authentication attempt fails. This is
     * called by authentication listeners inheriting from
     * AbstractAuthenticationListener.
     *
     * @param Request $request
     * @param AuthenticationException $exception
     *
     * @return Response The response to return, never null
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        return new Response($exception->getMessageData(), 401);  // TODO: Determine if this is the right place to put this
    }
}
