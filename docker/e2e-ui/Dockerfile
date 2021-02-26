FROM lf-ui:latest

# build/compile front-end app
RUN gulp sass webpack-lf

# copy in test folder
COPY docker/e2e-ui/run.sh /
COPY test/ /data/test/

RUN gulp test-e2e-clean-compile

# make wait available for container ochestration
COPY --from=wait /wait /wait

CMD run.sh
