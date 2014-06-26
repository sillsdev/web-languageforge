#!/bin/bash

# Run this script in your development virtual machine, in an empty folder
# that you have write access in (e.g., mkdir tmp; cd tmp; sh this_script)
# and it should automatically create a self-signed SSL certificate for
# scriptureforge.local (and several other names; see line 59 and following
# if you want to change the names created). It will then enable SSL in your
# VM's Apache installation and restart Apache for you.

# In short, after running this script, you should be able to use HTTPS to
# connect to your local development copy of the Scriptureforge site.

# Modify OpenSSL config file to include appropriate subjectAltNames
cp /etc/ssl/openssl.cnf .
patch -p0 -i - openssl.cnf <<EOF
--- /etc/ssl/openssl.cnf	2013-03-19 02:44:03.000000000 +0700
+++ openssl.cnf	2014-06-02 14:46:40.665624726 +0700
@@ -122,21 +122,21 @@
 # WARNING: ancient versions of Netscape crash on BMPStrings or UTF8Strings.
 string_mask = utf8only
 
-# req_extensions = v3_req # The extensions to add to a certificate request
+req_extensions = v3_req # The extensions to add to a certificate request
 
 [ req_distinguished_name ]
 countryName			= Country Name (2 letter code)
-countryName_default		= AU
+countryName_default		= TH
 countryName_min			= 2
 countryName_max			= 2
 
 stateOrProvinceName		= State or Province Name (full name)
-stateOrProvinceName_default	= Some-State
+stateOrProvinceName_default	= Chiang Mai
 
 localityName			= Locality Name (eg, city)
 
 0.organizationName		= Organization Name (eg, company)
-0.organizationName_default	= Internet Widgits Pty Ltd
+0.organizationName_default	= SIL
 
 # we can do this but it is not needed normally :-)
 #1.organizationName		= Second Organization Name (eg, company)
@@ -146,6 +146,7 @@
 #organizationalUnitName_default	=
 
 commonName			= Common Name (e.g. server FQDN or YOUR name)
+commonName_default		= scriptureforge.local
 commonName_max			= 64
 
 emailAddress			= Email Address
@@ -220,6 +221,15 @@
 
 basicConstraints = CA:FALSE
 keyUsage = nonRepudiation, digitalSignature, keyEncipherment
+subjectAltName = @alt_names
+
+[ alt_names ]
+DNS.1 = scriptureforge.local
+DNS.2 = jamaicanpsalms.local
+DNS.3 = www.scriptureforge.local
+DNS.4 = www.jamaicanpsalms.local
+DNS.5 = jamaicanpsalms.scriptureforge.local
+DNS.6 = www.jamaicanpsalms.scriptureforge.local
 
 [ v3_ca ]
 
EOF

# Create the key
openssl genrsa -out san_scriptureforge_local.key 4096
chmod 0600 san_scriptureforge_local.key

# Use our patched local config to create the Certificate Signing Request (CSR)
openssl req -new -out san_scriptureforge_local.csr -key san_scriptureforge_local.key -config openssl.cnf

# Self-sign the CSR for almost ten years (3650 days)
openssl x509 -req -days 3650 -in san_scriptureforge_local.csr -signkey san_scriptureforge_local.key -out san_scriptureforge_local.crt -extensions v3_req -extfile openssl.cnf

# Install the key and certificate
sudo mkdir -p /etc/ssl/localcerts
sudo cp san_scriptureforge_local.key /etc/ssl/localcerts
sudo cp san_scriptureforge_local.crt /etc/ssl/localcerts

# Set up Apache for the new SSL version of the site
sudo cp /etc/apache2/sites-available/scriptureforge /etc/apache2/sites-available/scriptureforge.ssl
sudo patch -p0 -i - /etc/apache2/sites-available/scriptureforge.ssl <<EOF
--- /etc/apache2/sites-available/scriptureforge	2014-06-02 14:25:56.631428998 +0700
+++ /etc/apache2/sites-available/scriptureforge.ssl	2014-06-02 14:26:02.099438649 +0700
@@ -1,6 +1,9 @@
-<VirtualHost *:80>
+<VirtualHost *:443>
 	DocumentRoot /var/www/scriptureforge.org_dev/htdocs
 	ServerName scriptureforge.local
+	SSLEngine on
+	SSLCertificateFile /etc/ssl/localcerts/san_scriptureforge_local.crt
+	SSLCertificateKeyFile /etc/ssl/localcerts/san_scriptureforge_local.key
 	ServerAlias sfwebchecks.local
 	ServerAlias sfweb.local
 	ServerAlias jamaicanpsalms.scriptureforge.local
EOF

# Restart Apache
sudo a2enmod ssl
sudo a2ensite scriptureforge.ssl
sudo apache2ctl configtest && sudo apache2ctl restart
