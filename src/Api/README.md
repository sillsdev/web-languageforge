## Enabling Local Dev with CORS

### Set CORS permissions on local angular2 app server

- Enable CORS for angular2 dev web server
	- Modify: `tools/tasks/seed/serve.coverage.watch.ts`. Add `cors: true` to server configuration options
	
	```
	browserSync.create().init({
		server: {
			baseDir: './' + coverageFolder
		},
		port: Config.COVERAGE_PORT,
		files: watchedFiles,
		logFileChanges: false,
		cors: true
	});
	```

### Set CORS permissions on remote development server

- Configure Apache to always send permissive CORS headers

	- Install and enable headers apache module
	
		```
		$ sudo a2enmod headers
		$ sudo vi /etc/apache2/mods-enabled/headers.load
		```
	- Add the following lines to headers.load
	
		```
		Header always set Access-Control-Allow-Origin "http://localhost:5555"
        Header always set Access-Control-Allow-Credentials "true"
        Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS, DELETE, PUT"
        Header always set Access-Control-Max-Age "1000"
        Header always set Access-Control-Allow-Headers "x-requested-with, Content-Type, origin, authorization, accept, client-security-token"
		```

- Configure languageforge (by way of apache directives) how to handle preflight OPTION requests

	- Add the following two lines after the `RewriteEngine On` directive in `web-languageforge/src/.htaccess`

		```
		
		RewriteCond %{REQUEST_METHOD} OPTIONS
		RewriteRule ^(.*)$ $1 [R=200,L]
		
		```

## Using Endpoints

### User Authenticate

1. Get an authentication token

	```
	curl 'http://m.languageforge.local/api/sf' -i -H 'Content-Type: application/json' -d '{"version":"2.0","method":"user_authenticate","params":["admin","password"],"id":1}'
	```

2. Use authentication token

	```
	curl 'http://m.languageforge.local/api/sf' -i -H 'Content-Type: application/json' -d '{"version":"2.0","method":"user_readProfile","params":[],"id":1}' --cookie 'REMEMBERME=U2l0ZVxNb2RlbFxVc2VyV2l0aElkOllXUnRhVzQ9OjE1MTYwODc4MDk6NDQ3MDIwOTUxZTY3YTE0MTY2MDI5NzI5OTM5NjBhYThlNGY0NWY0N2VlNmUyN2M4YmQ1NDc4NTA4YTgyZGU3Yw%3D%3D'
	```

