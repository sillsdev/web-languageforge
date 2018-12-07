#!/bin/bash

CONFIGURATION=${CONFIGURATION:-Release}
DEPLOY_RUNTIME=${DEPLOY_RUNTIME:-linux-x64}
BUILD_OUTPUT=artifacts
DEPLOY_PATH=/var/www/$APP_NAME.org$APP_SUFFIX

pushd .. > /dev/null

rm -rf $BUILD_OUTPUT/app/*
dotnet publish -c $CONFIGURATION -r $DEPLOY_RUNTIME -o ../../$BUILD_OUTPUT/app src/$PROJECT/$PROJECT.csproj || exit 1

cat <<EOF > $BUILD_OUTPUT/app/secrets.json
{
  "Paratext": {
    "ClientId": "$PARATEXT_CLIENT_ID",
    "ClientSecret": "$PARATEXT_API_TOKEN"
  },
  "GoogleCaptcha": {
    "CaptchaSecret": "$CAPTCHA_SECRET_KEY"
  }
}
EOF

sudo chown -R :www-data $BUILD_OUTPUT/app

rsync -progzlt --chmod=Dug=rwx,Fug=rwx,o-rwx --delete-during --stats --rsync-path="sudo rsync" --rsh="ssh -v -i $DEPLOY_CREDENTIALS" artifacts/app/ root@$DEPLOY_DESTINATION:$DEPLOY_PATH/app || exit 1

popd > /dev/null

ssh root@$DEPLOY_DESTINATION "systemctl restart $APP_NAME-web-app"
