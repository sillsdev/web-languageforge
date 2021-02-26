FROM lf-ui:latest

# make wait available for container ochestration
COPY --from=wait /wait /wait

# copy in test folder
COPY docker/e2e-ui/run.sh /run.sh
COPY test/ /data/test/

RUN gulp test-e2e-clean-compile

CMD ["/run.sh"]
