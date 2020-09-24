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
        return $client->request($method, $url, $opts);
    }
}


?>
