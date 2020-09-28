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
        $url = 'http://localhost:4200/api/' . $url;
        // Should eventually be: $url = 'https://admin.languagedepot.org/api/' . $url;

        $opts = [];
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
            $json = \GuzzleHttp\json_decode($response->getBody(), true);
            $statusCode = $response->getStatusCode();
            if (isset($json['ok']) && $json['ok']) {
                return $json['data'];
            } else {
                if (isset($json['message'])) {
                    $message = $json['message'];
                } else {
                    $message = '';
                }
                throw new Exception($message);
            }
        } else {
            throw new Exception("");
        }
    }
}


?>
