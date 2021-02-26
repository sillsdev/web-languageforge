FROM lf-ui:latest

# build/compile front-end app
RUN gulp sass webpack-lf

# copy in test folder
COPY rune2e.sh /data/
COPY test/ /data/test/

# make wait available for container ochestration
COPY --from=wait /wait /wait

CMD ["./rune2e.sh"]
