FROM lf-ui:latest

WORKDIR /data

RUN gulp sass webpack-lf

COPY rune2e.sh /data/
COPY test/ /data/test/

# Add docker-compose-wait tool -------------------
# see https://www.datanovia.com/en/courses/docker-compose-wait-for-dependencies/
# Note:
# this container depends upon running/functioning mail and db containers.  These take
# time to initialize, and scripts such as running tests or db-reset might fail if the
# db or mail service are not fully up yet.  We can use docker-compose-wait in downstream
# containers to wait for these services to be started
ENV WAIT_VERSION=2.7.2 \
    WAIT_HOSTS=db:27017,mail:25,selenium:4444 \
    WAIT_HOSTS_TIMEOUT=300 \
    WAIT_SLEEP_INTERVAL=2 \
    WAIT_HOST_CONNECT_TIMEOUT=30
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

CMD ["./rune2e.sh"]
