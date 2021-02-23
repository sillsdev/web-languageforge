<?php

namespace Api\Service;

use Api\Library\Shared\SilexSessionHelper;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use Silex\Application;
use \Firebase\JWT\JWT;

require_once APPPATH . 'vendor/autoload.php';

class Ldapi
{
    public static function callDotnetCoreServer($method, $url, array $jsonData = null)
    {
        $url = 'http://localhost:8085/api/v2/' . $url;
        // Should eventually be: $url = 'https://admin.languagedepot.org/api/' . $url;

        $opts = [
            'http_errors' => false,
            'headers' => [ 'Authorization' => 'Bearer ' . LANGUAGE_DEPOT_API_TOKEN ],
        ];
        if (isset($jsonData)) {
            $opts['json'] = $jsonData;
        }

        $handler = HandlerStack::create();
        $client = new Client(['handler' => $handler]);

        // To implement retrying, uncomment below
        // $tryCounter = 1;
        // while ($tryCounter <= 5) {
        //     try {
        //         $result->errorMessage = '';
        //         $response = $client->request($method, $url, $opts);
        //         break;
        //     } catch (RequestException $e) {
        //         $response = $e->getResponse();
        //         if ($e->getCode() != 403 && $e->getCode() != 404) {
        //             $tryCounter++;
        //             $result->errorMessage = $e->getMessage();
        //             continue;
        //         }
        //         break;
        //     }
        // }
        $response = $client->request($method, $url, $opts);

        if (isset($response)) {
            $body = $response->getBody();
            try {
                $json = \GuzzleHttp\json_decode($body, true);
            } catch (\Exception $e) {
            }
            $statusCode = $response->getStatusCode();
            if (isset($json) && isset($json['ok']) && $json['ok']) {
                return $json['data'];
            } else {
                if (isset($json) && isset($json['message'])) {
                    $message = $json['message'];
                } else {
                    $message = $body;
                }
                throw new \Exception($message);
            }
        } else {
            throw new \Exception("");
        }
    }

    public static function callNodeJsServer($languageDepotUsername, $method, $url, array $jsonData = null)
    {
        $baseUrl = 'http://localhost:3000/api/v2/';     // Node.js server
        // $baseUrl = 'http://172.17.0.1:3000/api/v2/';     // Node.js server on localhost (Docker internal IP for localhost is 172.17.0.1)
        // Should eventually be: $baseUrl = 'https://admin.languagedepot.org/api/';

        if ($languageDepotUsername) {
            $jwtPayload = [
                "sub" => $languageDepotUsername,
                "aud" => "https://admin.languagedepot.org/api/v2",
                "iat" => time() - 5,  // Backdate 5 seconds in case of clock skew
                "exp" => time() + 60,  // One-minute tokens so even if someone intercepts them, they can't use them
            ];
            $jwt = JWT::encode($jwtPayload, LANGUAGE_DEPOT_API_TOKEN, 'HS256');
        } else {
            $jwt = null;
        }

        $opts = [
            'http_errors' => false,
        ];
        if (isset($jwt)) {
            $opts['headers'] = [ 'Authorization' => 'Bearer ' . $jwt];
        }
        if (isset($jsonData)) {
            $opts['json'] = $jsonData;
        }

        $handler = HandlerStack::create();
        $client = new Client(['handler' => $handler]);

        // To implement retrying, uncomment below
        // $tryCounter = 1;
        // while ($tryCounter <= 5) {
        //     try {
        //         $result->errorMessage = '';
        //         $response = $client->request($method, $url, $opts);
        //         break;
        //     } catch (RequestException $e) {
        //         $response = $e->getResponse();
        //         if ($e->getCode() != 403 && $e->getCode() != 404) {
        //             $tryCounter++;
        //             $result->errorMessage = $e->getMessage();
        //             continue;
        //         }
        //         break;
        //     }
        // }
        try {
            $response = $client->request($method, $baseUrl . $url, $opts);
        } catch (ConnectException $e) {
            if (ENVIRONMENT == 'development' && (strpos($baseUrl, '172.17.0.1') !== false || strpos($baseUrl, 'localhost') !== false)) {
                // Ignore "connection refused" errors, as that just means local LDAPI dev environment isn't running
                return '';
            }
        }

        if (isset($response)) {
            $body = $response->getBody();
            try {
                $json = \GuzzleHttp\json_decode($body, true);
            } catch (\Exception $e) {
                error_log("Decoding json failed: $body");
                error_log($e);
                throw $e;
            }
            $statusCode = $response->getStatusCode();
            // TODO: Do something if status code is 400
            return $json;
        } else {
            throw new \Exception("");
        }
    }

    public static function call($languageDepotUsername, $method, $url, array $jsonData = null)
    {
        // return Ldapi::callDotnetCoreServer($method, $url, $jsonData);
        return Ldapi::callNodeJsServer($languageDepotUsername, $method, $url, $jsonData);
    }
}

?>
