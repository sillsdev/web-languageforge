<?php

namespace Api\Service;

use Api\Library\Shared\Website;
use Silex\Application;

require_once APPPATH . 'vendor/autoload.php';

class TestControl
{
    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->website = Website::get();
    }

    /** @var Application */
    private $app;

    /** @var Website */
    private $website;

    public function checkPermissions($methodName)
    {
        // Do nothing; all methods are allowed
    }

    public function checkPermissionsWithParams($methodName, $params = null) {
        // Do nothing; all methods are allowed
    }

    // -------------------- API COMMANDS --------------------

    public function check_test_api()
    {
        return ['api_is_working' => true];
    }
}
