# hgweb Docker image

## What's Gunicorn? What's Meinheld? Why not use nginx?

Mercurial's built-in hgweb app can run as either a CGI app or a [WSGI](https://docs.python.org/3/library/wsgiref.html) app.
I (Robin Munn) decided that WSGI would be significantly faster since that way the Web server could keep a long-running Python
process going, whereas the CGI approach would require starting up Python for every request. I originally planned to use an nginx
container, and a bit of DuckDuckGo searching led me to https://github.com/tiangolo/uwsgi-nginx-docker/. But the README for that
project recommended https://github.com/tiangolo/meinheld-gunicorn-docker instead, saying that the Meinheld+Gunicorn solution
would provide four times the performance of WSGI under Nginx.
