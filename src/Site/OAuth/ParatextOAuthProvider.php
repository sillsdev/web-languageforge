<?php

namespace Site\OAuth;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use League\OAuth2\Client\Tool\BearerAuthorizationTrait;
use Psr\Http\Message\ResponseInterface;

class ParatextOAuthProvider extends AbstractProvider
{
    use BearerAuthorizationTrait;
    protected function getAuthorizationParameters(array $options)
    {
        // Default provider adds "approval_prompt=auto", and it doesn't seem that that's what is causing Paratext to fail (as of 2017-11-17 - RM)
        $params = parent::getAuthorizationParameters($options);
//        $params['prompt'] = 'select_account';
//        unset($params['approval_prompt']);
        return $params;
    }
    // TODO: Remove this function if it turns out to make no changes to the parent's auth params.


    public function getBaseUrl()
    {
        return 'https://registry-dev.paratext.org';
//        return 'https://registry.paratext.org';
    }

    protected function getAccessTokenBody(array $params)
    {
//        throw new Exception(print_r($params, true));
        $clonedParams = $params;  // This *COPIES* the array (PHP has *weird* semantics!!)
        unset($clonedParams['token']);
//        unset($clonedParams['client_id']);
        unset($clonedParams['client_secret']);
        unset($clonedParams['redirect_uri']);
        return $this->buildQueryString($clonedParams);
//        return '{"grant_type": "authorization_code", "code": "' . $params['code'] . '", "client_id": "DbDDp7nAdPYtuJL9L"}';
//        return '{"grant_type": "authorization_code", "code": "' . $params['code'] . '"}';
    }

    // Override because Paratext returns resource owner details inside the access token itself!
    public function getResourceOwner(OAuthAccessToken $token)
    {
        return $this->createResourceOwner([], $token);
    }

    /**
     * Returns the base URL for authorizing a client.
     *
     * Eg. https://oauth.service.com/authorize
     *
     * @return string
     */
    public function getBaseAuthorizationUrl()
    {
        return $this->getBaseUrl() . '/auth';
    }

    /**
     * Returns the base URL for requesting an access token.
     *
     * Eg. https://oauth.service.com/token
     *
     * @param array $params
     * @return string
     */
    public function getBaseAccessTokenUrl(array $params)
    {
        return $this->getBaseUrl() . '/api8/token';
    }

    /**
     * Returns the URL for requesting the resource owner's details.
     *
     * @param OAuthAccessToken $token
     * @return string
     */
    public function getResourceOwnerDetailsUrl(OAuthAccessToken $token)
    {
        return $this->getBaseUrl() . '/api8/userinfo';
    }

    protected function getScopeSeparator()
    {
        return ' ';
    }

    /**
     * Returns the default scopes used by this provider.
     *
     * This should only be the scopes that are required to request the details
     * of the resource owner, rather than all the available scopes.
     *
     * @return array
     */
    protected function getDefaultScopes()
    {
        return [
            'email',
            'openid',
//            'oauth:authorization_code',
            'projects:read',
        ];
    }

    /**
     * Checks a provider response for errors.
     *
     * @throws IdentityProviderException
     * @param  ResponseInterface $response
     * @param  array|string $data Parsed response data
     * @return void
     */
    protected function checkResponse(ResponseInterface $response, $data)
    {
        if (!empty($data['error'])) {
            $code  = 0;
            $error = $data['error'];

            if (is_array($error)) {
                $code  = $error['code'];
                $error = $error['message'];
            }

            throw new IdentityProviderException($error, $code, $data);
        }
    }

    // Need to override because Paratext requires "Authorization: Bearer" when you get an access token
    protected function getAccessTokenRequest(array $params)
    {
        $method  = $this->getAccessTokenMethod();
        $url     = $this->getAccessTokenUrl($params);
        $options = $this->getAccessTokenOptions($params);

        if (isset($params['token'])) {
            return $this->getAuthenticatedRequest($method, $url, $params['token'], $options);
        } else {
            return $this->getRequest($method, $url, $options);
        }
    }

    public function getAccessToken($grant, array $options = [])
    {
        $options = array_merge($options, ['token' => PARATEXT_API_TOKEN]);
        return parent::getAccessToken($grant, $options);
    }

    /**
     * Generates a resource owner object from a successful resource owner
     * details request.
     *
     * @param  array $response (required for API compatibility but ignored)
     * @param  OAuthAccessToken $token
     * @return ResourceOwnerInterface | null
     */
    protected function createResourceOwner(array $response, OAuthAccessToken $token)
    {
        if (isset($token->getValues()['id_token'])) {
            $id_token = $token->getValues()['id_token'];
            $jwt_parts = explode(".", $id_token);
            if (isset($jwt_parts[1])) {
                $json_details = base64_decode($jwt_parts[1]);
                $id_details = json_decode($json_details, true);
                return new ParatextUser($id_details);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
