<?php

namespace Site\Handler;

use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

class ErrorHandler
{
    public static function response(\Exception $e, $code, Application $app) {
        switch ($code) {
            case 403:
                return $app['twig']->render('error403.twig', array());
                break;
            case 404:
                return $app['twig']->render('error404.twig', array());
                break;
            default:
                return new Response('We are sorry, something went wrong.' . "\nCode: $code \nException: " . $e->getMessage() . "\nStack Trace: " . $e->getTraceAsString());
        }
    }
}
