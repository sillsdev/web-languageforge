<?php

namespace Site\Controller;

use Silex\Application;

class Page extends Base
{
    public function view(Application $app, $pageName) {
        return $this->renderPage($app, $pageName);
    }
}
