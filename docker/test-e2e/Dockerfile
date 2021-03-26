FROM lf-ui-builder:latest

# make wait available for container ochestration
COPY --from=megahirt/wait /wait /wait

COPY docker/test-e2e/run.sh /run.sh

# copy in test folder
COPY test/ /data/test/

RUN npm run compile-test-e2e

CMD ["/run.sh"]
