#!/bin/bash

cd /var/www/test/app
php setupTestEnvironment.php localhost
chmod -R g+w /var/www/html/assets /var/www/html/cache
chown -R :www-data /var/www/html/assets /var/www/html/cache
apache2-foreground
