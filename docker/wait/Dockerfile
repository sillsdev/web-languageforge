FROM busybox

# see https://www.datanovia.com/en/courses/docker-compose-wait-for-dependencies/
ENV WAIT_HOSTS_TIMEOUT=300 \
    WAIT_SLEEP_INTERVAL=2 \
    WAIT_HOST_CONNECT_TIMEOUT=30

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait wait
RUN chmod +x wait
