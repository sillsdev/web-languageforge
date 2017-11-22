<?php

namespace Site\OAuth;

use Api\Model\Shared\UserModel;
use GuzzleHttp\Client;
use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Token\AccessToken as OAuthAccessToken;
use PHPUnit\Runner\Exception;
use Silex\Application;
use Site\Controller\OAuthBase;
use Site\Controller\ResourceOwnerInterfaceWithMoreDetails;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ParatextOAuth extends OAuthBase
{
    public function getProviderName(): string
    {
        return "paratext";
    }

    public function oauthCallback(Request $request, Application $app)
    {
        return parent::oauthCallback($request, $app);
    }

    /**
     * @param $redirectUri
     * @return AbstractProvider
     */
    protected function getOAuthProvider($redirectUri): AbstractProvider
    {
        $provider = new ParatextOAuthProvider([
            'clientId' => 'DbDDp7nAdPYtuJL9L', // TODO: Move to config.php
            'clientSecret' => '',
            'redirectUri' => $redirectUri,
        ]);
        return $provider;
    }


    protected function handleOAuthToken(Application $app, AbstractProvider $provider, OAuthAccessToken $token)
    {
        // DEBUG: Debug code below, replace with actual code once we know what we're going to do with this
        try {
            $foo = $provider->getResourceOwner($token);
            if (is_null($foo)) {
                return new Response("Resource owner details were null!");
            }
            $fooStr = print_r($foo->toArray(), true);
            if ($foo instanceof ResourceOwnerInterfaceWithMoreDetails) {
                $fooStr = $fooStr . '<br/>And user name was ' . $foo->getName();
                $fooStr = $fooStr . '<br/>And email was ' . $foo->getEmail();
                $fooStr = $fooStr . '<br/>And avatar was ' . $foo->getAvatar();
            }
            if ($foo instanceof ParatextUser) {
                $fooStr = $fooStr . '<br/>And pt_approved was ' . $foo->getIsPtApproved();
            }
            $id = $foo->getId();
            $user = new UserModel();
            if (is_null($id)) {
            } else {
                $user->readByPropertyArrayContains('paratextOAuthIds', $id);
                if ($user->id->asString()) {
                    $fooStr = $fooStr . '<br/>And SF user ID  was ' . print_r($user->id->asString(), true);
                    $fooStr = $fooStr . '<br/>And SF username was ' . print_r($user->username, true);
                }
            }
            $tokenStr = print_r($token, true);
            $dataUri = "https://data-access-dev.paratext.org/api8/projects";
            $request = new \GuzzleHttp\Psr7\Request("GET", $dataUri, ["Authorization" => "Bearer " . $token]);
            $client = new Client();
            // DEBUG: The request is getting rejected by Paratext (401 Unauthorized), and I don't know why
            // $response = $client->send($request); // TODO: Is there a shortcut method?
            return new Response("DEBUG: Token was:<br/><br/><pre>$tokenStr</pre><br/>Also got the following array for resource owner details:<br/><pre>$fooStr</pre>");
        } catch (Exception $e) {
            return new Response('DEBUG: Failure using token', 200);  // TODO: determine how to handle this scenario
        }
    }

    public function chooseRedirectUrl(bool $tokenSuccess, Application $app) : string
    {
        return '/auth/show_paratext_projects';
    }
}
