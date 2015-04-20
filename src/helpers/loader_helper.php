<?php
// Do not give the loader a namespace, it shold always in root.

require_once(APPPATH . 'vendor/autoload.php');

class Loader
{
    // here we store the already-initialized namespaces
    private static $loadedNamespaces = array();

    public static function loadClass($className)
    {
        $classPath = $className;

        $prefix = substr($className, 0, 3);
        if ($prefix == 'CI_' || $prefix == 'MY_') {
            return;
        }
        //error_log("Loader: Loading $classPath");

        // we assume the class AAA\BBB\CCC is placed in /AAA/BBB/CCC.php
        $classPath = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $classPath);

        // we get the namespace parts
        $namespaces = explode(DIRECTORY_SEPARATOR, $classPath);
        unset($namespaces[sizeof($namespaces)-1]); // the last item is the classname so remove that

        // now loop over namespaces
        $current = "";
        foreach ($namespaces as $namepart) {
            // Chain $namepart to parent namespace string
            $current .= '\\' . $namepart;
            // Skip if the namespace is already initialized
            if(in_array($current, self::$loadedNamespaces)) continue;
            // Now have a namespace to load, so:
            $fnload = $current . DIRECTORY_SEPARATOR . "__init.php";
            if(file_exists($fnload)) require $fnload;
            // then we flag the namespace as already-loaded
            self::$loadedNamespaces[] = $current;
        }

        // we build the filename to require
        $load = APPPATH . $classPath . ".php";
        // check for file existence
        if (file_exists($load)) {
            require $load;
// Don't log when using other loaders.  This loader may not be authoritative.
//         } else {
//             error_log("Loader: Cannot find source file '$load'");
        }
        //error_log(sprintf("Loader: exists %s %d", $className, class_exists($className, false)));
        return class_exists($className, false);
    }

    public static function register()
    {
        spl_autoload_register("Loader::loadClass");
    }

    public static function unregister()
    {
        spl_autoload_unregister("Loader::loadClass");
    }
}

Loader::register();
