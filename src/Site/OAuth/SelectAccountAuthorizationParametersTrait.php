<?php

namespace Site\OAuth;

/**
 * Use this trait in any OAuthProviders you create, so that you don't have to duplicate this code repeatedly
 */
trait SelectAccountAuthorizationParametersTrait
{
    protected function getAuthorizationParameters(array $options): array
    {
        // Default provider adds "approval_prompt=auto", but using both "prompt" and "approval_prompt" together is not allowed
        $params = parent::getAuthorizationParameters($options);
        $params["prompt"] = "select_account";
        unset($params["approval_prompt"]);
        return $params;
    }
}
