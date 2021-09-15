<?php

namespace Site\Controller;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class Page extends Base
{
    /**
     * @param Request $request
     * @param Application $app
     * @param $pageName
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \Exception
     */
    public function view(
        /** @noinspection PhpUnusedParameterInspection */ Request $request,
        Application $app, $pageName
    ) {
        try {
            $this->setupBaseVariables($app);
        } catch (\Exception $e) {
            return $app->redirect('/auth/logout');
        }

        $this->setupPageVariables($app);

        // special case for "brochure" HTML5 homepage
        if ($pageName == 'home') {
            if ($this->_isLoggedIn) {
                return $app->redirect('/redirect/project');
            }
            $homepageInAFolder = $this->getThemePath() . '/page/home';
            if (is_dir($homepageInAFolder)) {
                $this->data['baseDir'] = $this->getThemePath() . '/page/home';
                try {
                    return $app['twig']->render('home/index.html.twig', $this->data);
                } catch (\Twig\Loader\ErrorLoader $e) {
                    $app->abort(404, "Page not found: home/index.html.twig");
                }
            }
        }

        return $this->renderPage($app, $pageName);
    }

    private function setupPageVariables(Application $app) {
    }
}
