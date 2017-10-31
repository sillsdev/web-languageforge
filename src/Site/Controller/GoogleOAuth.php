<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class GoogleOAuth extends Base
{
    public function oauthCallback(Request $request, Application $app)
    {
        $provider = new \League\OAuth2\Client\Provider\Google([
            'clientId'     => GOOGLE_CLIENT_ID,
            'clientSecret' => GOOGLE_CLIENT_SECRET,
            'redirectUri'  => 'https://localdev.scriptureforge.org/oauthcallback',
            'hostedDomain' => 'https://localdev.scriptureforge.org',
        ]);

        $error = $request->query->get('error', null);
        if (! is_null($error)) {
            return new Response('OAuth error ' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8'), 200);
        }
        if ($app['session']->has('oauthtoken')) {
            $token = $app['session']->get('oauthtoken');
        } else {
            $code = $request->query->get('code', null);
            if (is_null($code)) {   //
                $authUrl = $provider->getAuthorizationUrl();
                $app['session']->set('oauth2state', $provider->getState());
                return new RedirectResponse($authUrl);
            } else {
                $state = $request->query->get('state', null);
                if (is_null($state) || ($state !== $app['session']->get('oauth2state'))) {
                    // Invalid state, which *could* indicate some kind of attempted hack (CSRF, etc.)
                    $app['session']->remove('oauth2state');
                    return new Response('DEBUG: Invalid OAuth state', 200);  // TODO: determine how to handle this scenario
                }
                if ($app['session']->has('oauthtoken')) {
                    $token = $app['session']->get('oauthtoken');
                } else {
                    $token = $provider->getAccessToken('authorization_code', [
                        'code' => $code
                    ]);
                    $app['session']->set('oauthtoken', $token);  // TODO: Decide how to store which provider the token is from (Google or Paratext, maybe Facebook in the future)
                }
            }
        }
        try {
            $userDetails = $provider->getResourceOwner($token);

            // look up UserModel with incoming oauthId
            $userModel = new UserModel();
            $userModel->readByPropertyArrayContains('googleOAuthId', $userDetails->getId());
            if (!$userModel->id->asString()) {
                $userModel->readByEmail($userDetails->getEmail());
                if (!$userModel->id->asString()) {
                    // no match found in database.  What should we do?
                    // - present UI for create new account or login to link existing account
                    //      - automatically create a new xForge account with user details (button 1)
                    //      - account linking (includes xforge login form + option to update email address on account - button 2)

                    // redirect to UI for creating new account
                }
            }

            // if we find a user with incoming oauthId, get that user model

            // if no user found, find user by email provided by oauth, then get that user model

            // then do automatic login
            $app['session']->set('allowOAuthLogin', true);
            $subRequest = Request::create(
                '/app/login_check', 'POST',
                array('_username' => $username, '_password' => 'oauthpassword'),
                $app['request']->cookies->all(), array(), $app['request']->server->all()
            );
            $app->handle($subRequest, HttpKernelInterface::MASTER_REQUEST, false);

            //return new Response('Hello, ' . $userDetails->getName() . '. Your email is ' . $userDetails->getEmail() . ' and your avatar is <img src="' . $userDetails->getAvatar() . '"/><br/>The token was ' . $token->getToken() . 'and the user ID was ' . $userDetails->getId(), 200);
        } catch (Exception $e) {
            return new Response('DEBUG: Failure getting user details', 200);  // TODO: determine how to handle this scenario
        }
    }
}
