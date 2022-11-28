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
        Application $app,
        $pageName
    ) {
        try {
            $this->setupBaseVariables($app);
        } catch (\Exception $e) {
            return $app->redirect("/auth/logout");
        }

        // special case for "brochure" HTML5 homepage
        if ($pageName == "home") {
            if ($this->_isLoggedIn) {
                return $app->redirect("/redirect/project");
            }

            $this->data["baseDir"] = "Site/views/languageforge/theme/default/page/home";

            return $app["twig"]->render("home/index.html.twig", $this->data);
        }

        return $this->renderPage($app, $pageName);
    }
}
