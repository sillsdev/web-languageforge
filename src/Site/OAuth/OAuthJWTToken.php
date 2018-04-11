<?php

namespace Site\OAuth;

use \Api\Library\Shared\JWTToken;
use Api\Library\Shared\Website;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class OAuthJWTToken extends GoogleOAuth
{
    // this function is an example that Micah provided me
    // the goal is to expose an OAuth API endpoint that, given an OAuth token generated from Android
    // can login and then return the JWT Token
    // Still TODO:
    //   - login to session
    //   - return valid JWT token
    //   - hook up route to this controller  e.g. /oauth/jwt
    function validateOAuthToken(Request $request, Application $app)
    {
        $website = Website::get();
        $oauthToken = $request->get("oauthToken");

        if (empty($oauthToken))
        {
            return false;
        }

        $opts = [
            "method"  => "POST",
            "header"  => "Content-type: application/x-www-form-urlencoded",
            "content" => http_build_query([
                "id_token" => $oauthToken,
            ]),
        ];

        $ctx = stream_context_create(["http" => $opts]);

        $accessReply = @file_get_contents(
            "https://www.googleapis.com/oauth2/v3/tokeninfo",
            false,
            $ctx
        );

        if ($accessReply === false)
        {
            return false;
        }

        $access = json_decode($accessReply, true);

        if (!isset($access["aud"], $access["sub"], $access["email"]))
        {
            return false;
        }

        if ($access["aud"] != ANDROID_CLIENT_ID)
        {
            return false;
        }

        // login
        $userModel = new UserModel();
        $userModel->readByPropertyArrayContains('googleOAuthIds', $access["sub"]);
        if (! OAuthBase::setSilexAuthToken($userModel, $app))
        {
            return false;  // Failed to set Silex auth token (should never happen, but check just in case)
        }

        // return valid JWT token
        $jwtToken = JWTToken::getAccessToken(30 * 24, $userModel->username, $website);

        return new JsonResponse($jwtToken);  // TODO: Does the Android app need anything more than a bare token in the JSON response?
    }
}
