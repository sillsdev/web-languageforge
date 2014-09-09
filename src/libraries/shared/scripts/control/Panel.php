<?php
namespace libraries\shared\scripts\control;

class Panel
{

    public function run()
    {
        $message = '<div ng-app>';
        $message .= '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>';
        $message .= '<h2>Scripts Control Panel {{}}</h2>';
        $message .= '<h3>Migration Scripts</h3>';
        $message .= '<select ng-model="run"><option value="">Test only</option><option value="/run">Run</option></select>';
        $message .= '<ul>';

        $scriptBaseNames = $this->scriptBaseNames();
        foreach ($scriptBaseNames as $baseName) {
            $message .= '<li><a href="/script/migration/' . $baseName . '{{run}}">' . $baseName . '.php </a></li>';
        }

        $message .= '</ul>';
        $message .= '</div>';

        return $message;
    }

    protected function scriptBaseNames()
    {
        $folderPath = APPPATH . 'libraries/shared/scripts/migration';
        $baseNames = glob($folderPath . '/*.php');
    	$file_count = count($baseNames);
		for ($i = 0; $i < $file_count; $i++)
		{
			$baseNames[$i] = basename($baseNames[$i], '.php');
		}

		return $baseNames;
    }
}
