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

namespace libraries\shared\palaso;

use libraries\shared\palaso\exceptions\ErrorHandler;
use libraries\shared\palaso\exceptions\ResourceNotAvailableException;
use libraries\shared\palaso\exceptions\UserNotAuthenticatedException;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use Palaso\Utilities\CodeGuard;

/**
 * This class build a json-RPC Server 1.0
 * http://json-rpc.org/wiki/specification
 *
 * @author sergio <jsonrpcphp@inservibile.org>
 * @author cambell <cambell.prince@gmail.com>
 */
class JsonRpcServer
{
    /**
	 * This function handle a request binding it to a given object
	 *
	 * @param object $object
	 * @param Output $output The CI Output class
	 * @return boolean
	 */
    public static function handle($object, $output)
    {
        // user-defined error handler to catch annoying php errors and throw them as exceptions
        set_error_handler(function ($errno, $errstr, $errfile, $errline) { throw new ErrorHandler($errstr, 0, $errno, $errfile, $errline); } , E_ALL);

        // checks if a JSON-RPC request has been received
        if (
            $_SERVER['REQUEST_METHOD'] != 'POST' ||
            empty($_SERVER['CONTENT_TYPE']) ||
             (strrpos($_SERVER['CONTENT_TYPE'], "application/json") === false && strrpos($_SERVER['CONTENT_TYPE'], "application/xml") === false)) {
            throw new \Exception("Not a JSON-RPC request: ct: '" . @$_SERVER['CONTENT_TYPE'] . "'");
        }

        // reads the input data
        $request = json_decode(file_get_contents('php://input'), true);

        // executes the task on local object
        try {
            // TODO: refactor to use an error dto
            $object->checkPermissions($request['method'], $request['params']);
            if (method_exists($object, $request['method'])) {
                $result = call_user_func_array(array($object,$request['method']),$request['params']);
                $response = array(
                    'jsonrpc' => '2.0',
                    'id' => $request['id'],
                    'result' => $result,
                    'error' => NULL
                );
            } else {
                $response = array(
                    'jsonrpc' => '2.0',
                    'id' => $request['id'],
                    'result' => NULL,
                    'error' => array(
                        'type' => 'UnknownMethod',
                        'message' => sprintf("unknown method '%s' on class '%s'", $request['method'], get_class($object))
                    )
                );
            }
        } catch (\Exception $e) {
            $response = array(
                'id' => $request['id'],
                'result' => NULL,
                'error' => array(
                    'type' => get_class($e),
                    'message' => $e->getMessage() . " line " . $e->getLine() . " " . $e->getFile() . " " . CodeGuard::getStackTrace($e->getTrace())
                )
            );
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

        // output the response
        if (!empty($request['id'])) {
            // notifications don't want response
            $output->set_content_type('text/javascript');
            $output->set_output(json_encode($response));
        }
        // finish
        return true;
    }

}
