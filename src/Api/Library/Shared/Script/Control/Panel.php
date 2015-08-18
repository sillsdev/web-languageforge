<?php

namespace Api\Library\Shared\Script\Control;

class Panel
{
    public function run() {
        $message = "{% verbatim %}\n";
        $message .= "<div data-ng-app>\n";
        $message .= "<script src=\"https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js\"></script>\n";
        $message .= "<h2>Scripts Control Panel {{}}</h2>\n";
        $message .= "<h3>Migration Scripts</h3>\n";
        $message .= "<select data-ng-model=\"run\"><option value=\"\">Test only</option><option value=\"/run\">Run</option></select>\n";
        $message .= "<ul>\n";

        $scriptBaseNames = $this->scriptBaseNames();
        foreach ($scriptBaseNames as $baseName) {
            $message .= '<li><a href="/script/Migration/'.$baseName.'{{run}}">'.$baseName.".php </a></li>\n";
        }

        $message .= "</ul>\n";
        $message .= "</div>\n";
        $message .= "{% endverbatim %}\n";

        return $message;
    }

    protected function scriptBaseNames() {
        $folderPath = APPPATH.'Api/Library/Shared/Script/Migration';
        $baseNames = glob($folderPath . '/*.php');
        $file_count = count($baseNames);
        for ($i = 0; $i < $file_count; $i++) {
            $baseNames[$i] = basename($baseNames[$i], '.php');
        }

        return $baseNames;
    }
}
