FROM lf-ui-builder:latest

# make wait available for container ochestration
COPY --from=wait /wait /wait

COPY docker/test-e2e/run.sh /run.sh

# copy in test folder
COPY test/ /data/test/

RUN gulp test-e2e-clean-compile

CMD ["/run.sh"]
