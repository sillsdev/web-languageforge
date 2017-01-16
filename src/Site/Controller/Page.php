<?php

namespace Site\Controller;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Page extends Base
{
    public function view(Request $request, Application $app, $pageName) {

        $this->setupBaseVariables($app);
        $this->setupPageVariables($app);

        // special case for "brochure" HTML5 homepage
        if ($pageName == 'home') {
            $homepageInAFolder = $this->getThemePath() . '/page/home';
            if (is_dir($homepageInAFolder)) {
                $this->data['baseDir'] = $this->getThemePath() . '/page/home';
                try {
                    return $app['twig']->render('home/index.html.twig', $this->data);
                } catch (\Twig_Error_Loader $e) {
                    $app->abort(404, "Page not found: home/index.html.twig");
                }
            }
        }

        return $this->renderPage($app, $pageName);
    }

    private function setupPageVariables(Application $app) {
        $this->data['isBootstrap4'] = (preg_match('@languageforge@', $app['request']->getHost()) == 1) ? true : false;
    }
}
