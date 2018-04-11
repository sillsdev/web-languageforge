<?php

namespace Site\Listener;

use Api\Library\Shared\JWTToken;
use Api\Library\Shared\Website;
use Site\OAuth\JWTSilexToken;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Security\Core\Authentication\AuthenticationManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Firewall\ListenerInterface;

class JWTListener implements ListenerInterface
{
    protected $tokenStorage;
    protected $authenticationManager;
    protected $website;

    public function __construct(TokenStorageInterface $tokenStorage, AuthenticationManagerInterface $authenticationManager, Website $website)
    {
        $this->tokenStorage = $tokenStorage;
        $this->authenticationManager = $authenticationManager;
        $this->website = $website;
    }

    /**
     * Handle authentication if there's a JWT token. If no token, return early so next authenticator is called.
     *
     * @param GetResponseEvent $event
     */
    public function handle(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        if (!$authHeader = $request->headers->get('Authorization')) {
            return;
        }

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            return;
        }
        $username = JWTToken::getUsernameFromToken($token, $this->website);
        if ($username === null) {
            // Invalid tokens shouldn't cause auth to fail completely, just cause it to proceed to login page
            return;
        }
        try {
            $token = new JWTSilexToken('anon.', $token, 'site');  // TODO: Figure out how Silex expects us to handle provider keys
            $authToken = $this->authenticationManager->authenticate($token);  // This should end up being the JWTAuthenticationProvider->authenticate() function.
            $this->tokenStorage->setToken($authToken);
        } catch (AuthenticationException $error) {
            return; // This will leave the token unset and we'll proceed to login page instead
        }
    }
}