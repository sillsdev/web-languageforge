<?php
/**
 * Created by PhpStorm.
 * User: rmunn
 * Date: 4/4/18
 * Time: 10:05 AM
 */

namespace Site\OAuth;


use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;

class JWTSilexToken extends AbstractToken
{
    private $credentials;
    private $providerKey;

    /**
     * Constructor basically copied from UsernamePasswordToken. Credentials will be the text of the JWT token.
     */
    public function __construct($user, $credentials, $providerKey, array $roles = array())
    {
        parent::__construct($roles);

        $this->setUser($user);
        $this->credentials = $credentials;
        $this->providerKey = $providerKey;

        parent::setAuthenticated(count($roles) > 0);
    }

    /**
     * {@inheritdoc}
     */
    public function setAuthenticated($isAuthenticated)
    {
        if ($isAuthenticated) {
            throw new \LogicException('Cannot set this token to trusted after instantiation.');
        }

        parent::setAuthenticated(false);
    }

    /**
     * {@inheritdoc}
     */
    public function getCredentials()
    {
        return $this->credentials;
    }

    /**
     * Returns the provider key.
     *
     * @return string The provider key
     */
    public function getProviderKey()
    {
        return $this->providerKey;
    }

    /**
     * {@inheritdoc}
     */
    public function eraseCredentials()
    {
        parent::eraseCredentials();

        $this->credentials = '';
    }

    /**
     * {@inheritdoc}
     */
    public function serialize()
    {
        return serialize(array($this->credentials, $this->providerKey, parent::serialize()));
    }

    /**
     * {@inheritdoc}
     */
    public function unserialize($serialized)
    {
        list($this->credentials, $this->providerKey, $parentStr) = unserialize($serialized);
        parent::unserialize($parentStr);
    }
}