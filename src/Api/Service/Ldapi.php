<?php

namespace Api\Service;

use Api\Library\Shared\SilexSessionHelper;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use Silex\Application;


require_once APPPATH . 'vendor/autoload.php';

class Ldapi
{
    public static function call($method, $url, array $jsonData = null)
    {
        $url = 'http://localhost:4200/api/v2/' . $url;
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
}


?>
