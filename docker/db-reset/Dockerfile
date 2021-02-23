FROM lf-api:latest

COPY scripts /var/www/scripts/
COPY docker/db-reset/run.sh /run.sh
WORKDIR /var/www/scripts/tools

CMD ["/run.sh"]
