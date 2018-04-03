<?php

namespace Api\Library\Shared;

use Firebase\JWT\JWT;

class JWTToken
{

    /**
     * @param int     $hoursValid Hours Valid
     * @param string $userId
     * @param Website $website
     * @return string - Access token
     */
    static function getAccessToken(int $hoursValid, string $userId, Website $website) {
        $issuedAt = time();
        $expiration = $issuedAt + ($hoursValid * 3600);
        $token = array(
            "iss" => $website->domain,
            "aud" => $website->domain,
            "iat" => $issuedAt,
            "exp" => $expiration,
            "sub" => $userId
        );
        return JWT::encode($token, JWT_KEY, 'HS256');
    }

    static function verifyAccessToken(object $tokenData, Website $website) {
        // JWT::decode takes care of checking signature for us, so we just need to check that the token is for our site
        if (empty($tokenData->iss) || empty($tokenData->aud)) {
            return false;
        }
        // Also check that token has a valid username in it, otherwise reject the token and proceed to login form
        if (empty($tokenData->sub)) {
            return false;
        }
        return ($tokenData->iss === $website->domain && $tokenData->aud === $website->domain);
    }

    static function getUsernameFromToken(string $token, Website $website) {
        $tokenData = JWT::decode($token, JWT_KEY, ['HS256']);
        if (! self::verifyAccessToken($tokenData, $website)) {
            return null;
        }
        if (! isset($tokenData->sub)) {
            return null;
        }
        return $tokenData->sub;
    }
}
