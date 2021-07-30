<?php
/*
 COPYRIGHT

Copyright 2007 Sergio Vaccaro <sergio@inservibile.org>

This file is part of JSON-RPC PHP.

JSON-RPC PHP is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

JSON-RPC PHP is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with JSON-RPC PHP; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

namespace Api\Library\Shared\Palaso;

use Api\Library\Shared\Palaso\Exception\ErrorHandler;
use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Library\Shared\Palaso\Exception\UserNotAuthenticatedException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Palaso\Utilities\CodeGuard;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

/**
 * This class build a json-RPC Server 1.0
 * http://json-rpc.org/wiki/specification
 *
 * @author sergio <jsonrpcphp@inservibile.org>
 * @author cambell <cambell.prince@gmail.com>
 * @author ira <ira.hopkinson@gmail.com>
 */
class JsonRpcServer
{
    /**
     * This function handle a request binding it to a given object
     *
     * @param Request $request
     * @param Application $app
     * @param object $api
     * @return array|null
     * @throws \Exception
     */
    public static function handle(Request $request, Application $app, $api) {
        // user-defined error handler to catch annoying php errors and throw them as exceptions
        set_error_handler(function ($errno, $errstr, $errfile, $errline) {
            throw new ErrorHandler($errstr, 0, $errno, $errfile, $errline);
        }, E_ALL);

        // checks if a JSON-RPC request has been received
        if ($_SERVER['REQUEST_METHOD'] != 'POST' ||
            empty($_SERVER['CONTENT_TYPE']) ||
             (strrpos($_SERVER['CONTENT_TYPE'], "application/json") === false &&
                 strrpos($_SERVER['CONTENT_TYPE'], "application/xml") === false)
        ) {
            throw new \Exception("Not a JSON-RPC request: ct: '" . @$_SERVER['CONTENT_TYPE'] . "'");
        }

        // executes the task on local object
        try {
            // TODO: refactor to use an error dto
            $api->checkPermissions($request->request->get('method'));
            if (method_exists($api, $request->request->get('method'))) {
                $orderedParams = InternationalUtility::arrayNormalize($request->request->get('params')['orderedParams']);
                $api->checkPermissionsWithParams($request->request->get('method'), $orderedParams);
                $result = call_user_func_array([$api, $request->request->get('method')], $orderedParams);
                $response = [
                    'jsonrpc' => '2.0',
                    'id' => $request->request->get('id'),
                    'result' => $result,
                    'error' => NULL
                ];
            } else {
                $response = [
                    'jsonrpc' => '2.0',
                    'id' => $request->request->get('id'),
                    'result' => NULL,
                    'error' => [
                        'type' => 'UnknownMethod',
                        'message' => sprintf("unknown method '%s' on class '%s'",
                            $request->request->get('method'), get_class($api))
                    ]
                ];
            }
        } catch (\Exception $e) {
            $response = [
                'id' => $request->request->get('id'),
                'result' => NULL,
                'error' => [
                    'type' => get_class($e),
                    'message' => $e->getMessage() . " line " . $e->getLine() . " " . $e->getFile() . " " .
                        CodeGuard::getStackTrace($e->getTrace())
                ]
            ];
            // Don't include filenames and line numbers in errors we report to the user
            if ($e instanceof ResourceNotAvailableException) {
                $response['error']['type'] = 'ResourceNotAvailableException';
                $response['error']['message'] = $e->getMessage();
            } elseif ($e instanceof UserNotAuthenticatedException) {
                $response['error']['type'] = 'UserNotAuthenticatedException';
                $response['error']['message'] = $e->getMessage();
            } elseif ($e instanceof UserUnauthorizedException) {
                $response['error']['type'] = 'UserUnauthorizedException';
                $response['error']['message'] = $e->getMessage();
            }
            $message = '';
            $message .= $e->getMessage() . "\n";
            $message .= $e->getTraceAsString() . "\n";
            error_log($message);
        }

        if (!$request->request->get('id')) {
            // notifications don't want response
            return null;
        }

        return $response;
    }
}
