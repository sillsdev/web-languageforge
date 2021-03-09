#!/bin/bash

cd /var/www/test/app
# Ensure test setup creates files with correct permissions, including allowing group-writable
umask 0002
su www-data -s /bin/sh -c 'php setupTestEnvironment.php localhost'
apache2-foreground
