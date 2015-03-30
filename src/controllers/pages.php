<?php

require_once 'base.php';

class pages extends Base
{
    public function view($page = 'frontpage')
    {
        $this->data['title'] = $this->website->name;
        $this->data['website'] = $this->website;
        $this->data['is_static_page'] = true;
        $templatePath = $this->getContentTemplatePath("pages/$page");
        if (empty($templatePath)) {
            show_404($this->website->base);
        } else {
            $this->renderPage("pages/$page");
        }
    }
}
