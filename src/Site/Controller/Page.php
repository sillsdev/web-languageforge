<?php

namespace Site\Controller;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Page extends Base
{
    public function view(Request $request, Application $app, $pageName) {

        // special case for "brochure" HTML5 homepage
        if ($pageName == 'home') {
            $homepageInAFolder = $this->getThemePath() . '/page/home';
            if (is_dir($homepageInAFolder)) {
                $this->loadTemplateVariablesForHomepageInAFolder($app);
                try {
                    return $app['twig']->render('home/index.html.twig', $this->data);
                } catch (\Twig_Error_Loader $e) {
                    $app->abort(404, "Page not found: home/index.html.twig");
                }
            }
        }

        return $this->renderPage($app, $pageName);
    }

    private function loadTemplateVariablesForHomepageInAFolder($app) {
        $this->data['isLoggedIn'] = $this->isLoggedIn($app);
        $this->data['baseDir'] = $this->getThemePath() . '/page/home';
    }
}
