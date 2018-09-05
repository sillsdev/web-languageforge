#!/bin/bash

CONFIGURATION=${CONFIGURATION:-Release}
DEPLOY_RUNTIME=${DEPLOY_RUNTIME:-linux-x64}
BUILD_OUTPUT=artifacts
DEPLOY_PATH=/var/www/$APP_NAME.org$APP_SUFFIX
URLS=http://unix:/tmp/$APP_NAME-web-app$APP_SUFFIX.sock

pushd .. > /dev/null

rm -rf $BUILD_OUTPUT/app/*
dotnet publish -c $CONFIGURATION -r $DEPLOY_RUNTIME -o ../../$BUILD_OUTPUT/app src/$PROJECT/$PROJECT.csproj || exit 1

cat > $BUILD_OUTPUT/app/hosting.json <<EOF
{
  "urls": "$URLS",
  "System": {
    "Hostname": "$HOSTNAME"
  },
  "Security": {
    "SigningCredential": "$DEPLOY_PATH/keys/signing.pfx"
  }
}
EOF

rsync -progzlt --chmod=Dug=rwx,Fug=rwx,o-rwx --delete-during --stats --rsync-path="sudo rsync" --rsh="ssh -v -i $DEPLOY_CREDENTIALS" artifacts/app/ root@$DEPLOY_DESTINATION:$DEPLOY_PATH/app || exit 1

popd > /dev/null

ssh root@$DEPLOY_DESTINATION "systemctl restart $APP_NAME-web-app"
