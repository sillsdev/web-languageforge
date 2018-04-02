<?php

namespace Site\OAuth;

use \Api\Library\Shared\JWTToken;

class GoogleAndroidOauth extends GoogleOAuthProvider
{

    // this function is an example that Micah provided me
    // the goal is to expose an OAuth API endpoint that, given an OAuth token generated from Android
    // can login and then return the JWT Token
    // Still TODO:
    //   - login to session
    //   - return valid JWT token
    //   - hook up route to this controller  e.g. /oauth/jwt
    function validateOAuthToken(string $oauthToken)
    {
        $opts = [
            "method"  => "POST",
            "header"  => "Content-type: application/x-www-form-urlencoded",
            "content" => http_build_query([
                "access_token" => $oauthToken,
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

        // return valid JWT token
        JWTToken::getAccessToken();


        return $jwtToken;
    }
}
