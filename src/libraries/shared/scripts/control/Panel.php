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
        $message .= '<li><a href="/script/migration/FixProjectRoles{{run}}">FixProjectRoles.php </a></li>';
        $message .= '<li><a href="/script/migration/MigrateQuestionTemplates{{run}}">MigrateQuestionTemplates.php </a></li>';
        $message .= '</ul>';
        $message .= '</div>';
/*        
        $_message = <<<EOT
<div ng-app>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>
    <h2>Scripts Control Panel</h2>
    <h3>Migration Scripts</h3>
    <select ng-model="run"><option value="">Test only</option><option value="/run">Run</option></select>
    <ul>
        <li><a href="/script/migration/FixProjectRoles{{run}}">FixProjectRoles.php </a></li>
        <li><a href="/script/migration/MigrateQuestionTemplates{{run}}">MigrateQuestionTemplates.php </a></li>
    </ul>
</div>
EOT;
        $_message = <<<EOD
<!doctype html>
<html ng-app='ControlPanel'>
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>
        <script src="/libraries/shared/scripts/control/script.js"></script>
    </head>
    <body>
        <h2>Scripts Control Panel</h2>
        <h3>Migration Scripts</h3>
        <select ng-model="run"><option value="">Test only</option><option value="/run">Run</option></select>
        <ul>
            <li><a href="/script/migration/FixProjectRoles{{run}}">FixProjectRoles.php </a></li>
            <li><a href="/script/migration/MigrateQuestionTemplates{{run}}">MigrateQuestionTemplates.php </a></li>
        </ul>
    </body>
</html>
EOD;
*/        
        return $message;
    }
}
