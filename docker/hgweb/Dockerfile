FROM debian:bullseye

# Most of this is copied from https://github.com/tiangolo/meinheld-gunicorn-docker (which is MIT licensed)
# I changed it to pull from Debian Bullseye instead of the Docker Python image, since Bullseye has a more up-to-date
# version of Mercurial as of now (2021-03-12)

# See README.md in same directory for more details about technology choices for this Docker image

RUN apt-get update && \
    apt-get install --yes apt-utils && \
    apt-get install --yes python3 python3-pip python3-venv

RUN apt-get install --yes mercurial

RUN pip3 install meinheld gunicorn

COPY entrypoint.sh /entrypoint.sh
COPY start.sh /start.sh
COPY gunicorn_conf.py /gunicorn_conf.py

COPY main.py /app/
WORKDIR /app/

ENV PYTHONPATH=/app

EXPOSE 80

COPY mkrepo.sh /mkrepo.sh
ENV SAMPLE_REPO=/srv/hg/project
RUN /mkrepo.sh

COPY hgweb.config /hgweb.config

ENTRYPOINT ["/entrypoint.sh"]

# Run the start script, it will check for an /app/prestart.sh script (e.g. for migrations)
# And then will start Gunicorn with Meinheld
CMD ["/start.sh"]
