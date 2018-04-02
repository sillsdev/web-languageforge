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
            "sub" => (string) $userId
        );
        return JWT::encode($token, JWT_KEY);
    }
}
