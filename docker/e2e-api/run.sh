#!/bin/bash

cd /var/www/test/app
php setupTestEnvironment.php localhost
apache2-foreground
