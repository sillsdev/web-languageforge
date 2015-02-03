<?php

require_once 'base.php';

class pages extends Base
{
    public function view($page = 'frontpage')
    {
        $data = array();
        $data['title'] = $this->website->name;
        $data['website'] = $this->website;
        $data['is_static_page'] = true;
        $templatePath = $this->getContentTemplatePath("pages/$page");
        if (empty($templatePath)) {
            show_404($this->website->base);
        } else {
            $this->renderPage("pages/$page", $data);
        }
    }
}
