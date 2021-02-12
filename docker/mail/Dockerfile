FROM juanluisbaptiste/postfix

ENV SMTP_SERVER=nobody.localhost \
SMTP_USERNAME=username \
SMTP_PASSWORD=password \
SERVER_HOSTNAME=nobody.localhost

# Note: previously in order to make this configuration change we volume mapped the entire /etc/postfix.cf
# configuration file and change the following line.  I have sinced learned that there is a proper
# tool called postconf that is used specifically to make changes to the configuration file
# this is a much better solution
RUN postconf -e "default_transport = retry:no outbound email allowed"
