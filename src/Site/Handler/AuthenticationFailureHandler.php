<?php
namespace Site\Handler;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationFailureHandler;
use Symfony\Component\Security\Http\HttpUtils;

class AuthenticationFailureHandler extends DefaultAuthenticationFailureHandler {

    public function __construct( HttpKernelInterface $httpKernel, HttpUtils $httpUtils, array $options = array(), LoggerInterface $logger = null ) {
        parent::__construct( $httpKernel, $httpUtils, $options, $logger );
    }

    public function onAuthenticationFailure( Request $request, AuthenticationException $exception ) {
        $response = parent::onAuthenticationFailure( $request, $exception );

        $json_request = $request->request->get('_json_request');
        if ($json_request == 'on') {

            $data = array(
                'jsonrpc' => '2.0',
                'result' => 0,
                'error' => NULL
            );

            return new JsonResponse($data);
        }

        return $response;
    }
}