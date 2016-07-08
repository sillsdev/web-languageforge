<?php

require_once('../../scriptsConfig.php');

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

class RunFixSemanticDomainKey {

    public static function run() {
        $user = new \Api\Model\UserModel();
        $user->readByUserName('chris');
        $userId = $user->id->asString();

        print("\n\n\n***Running FixSemanticDomainKey\n");
        $class = new \Api\Library\Shared\Script\Migration\FixSemanticDomainKey;
        $class->run($userId, 'run');
    }
}

RunFixSemanticDomainKey::run();