FROM alpine

RUN mkdir -p /data/dropzone

COPY watcher /data/
WORKDIR /data

RUN chmod +x watcher

CMD inotifyd /data/watcher /data/dropzone:n

