# Application Deployment and Release Guide

This guide describes our Release and Deployment processes.

# Release Naming Conventions and Cadence

The Language Forge project is under active development and as a project team we value shipping early and shipping often. In the past we have used a form of semantic versioning for our version names, however moving forward our releases will be [publicized on our community support site](https://community.software.sil.org/c/language-forge/20) as the YYYY-MM release. We will publish a summary of changes on our community site, once a month for all releases/changes that occurred during the prior month.

Releases are tagged in Git using the naming convention `vYYYY-MM-DD` and Docker images as `YYYY-MM-DD` (omitting the preceding `v`). In the event that we release twice in a single day, the release shall be named `YYYY-MM-DDb`, containing a distinguishing trailing letter.

## Application deployment

Language Forge is built to run in a containerized environment. Kubernetes is our chosen runtime platform for production. Deployments are automated under the right circumstances using GitHub Actions.

### Staging

Current workflow:

1. merge PR into or make commits on `develop` branch
1. this will kick off the GHA (`.github/workflows/staging.yml`) to build, test and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags) and deploy this code to the staging environment.

Update the image tags in `staging/kustomization.yaml`

Staging deployments can be manually run with `make deploy-staging`.
Note, this command assumes that the staging k8s context is named dallas-rke

### Production

[languageforge.org](https://languageforge.org)

Current workflow:

1. merge from `develop` into `master`
1. "Draft a new release" on https://github.com/sillsdev/web-languageforge/releases with a `vYYYY-MM-DD` tag format
1. "Publish" the new release
1. this will kick off the GHA (`.github/workflows/production.yml`) to build, test and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags) and deploy this code to the production environment at https://languageforge.org

Update the image tags in `prod/kustomization.yaml`

Production deployments can be manually run with `make deploy-prod`.
Note, this command assumes that the staging k8s context is named aws-rke

### Revert

Various tagged images are maintained in Docker Hub. If you need to revert to a previous version, you can do so by running the deployments scripts with the appropriate permissions or utilizing the Kubernetes UI to change the image of a deployment at any time.

### Backup/Restore

Backups will be established automatically by LTOps and utilized by LF through the `storageClassName` property in a Persistent Volume Claim. This storage class provided by LTOps establishes both a frequency and retention for a backup. Any time a restoration is needed, the LF team will need to coordinate the effort with LTOps. The process of restoring from a point in time will require the application be brought down for maintenance. The process will roughly follow these steps:

1. Notify LTOps of the need to restore a backup (App team)
1. Coordinate a time to bring the app down for maintenance (LTOps/App team)
1. Scale the app down (LTOps/App team)
1. Initiate the Backup restore (LTOps)
1. Notify app team of the restoration completion (LTOps)
1. Scale the app up (LTOps/App team)
1. Test the app (App team)
1. Communicate maintenance completion

### Database upgrades

Since database upgrades are so infrequent, require extra care and a brief outage, they are to be done manually:

1. Follow the MongoDB release notes / upgrade guide for the version of Mongo you plan to upgrade to. e.g. [Mongo 5.0 standalone upgrade guide](https://www.mongodb.com/docs/manual/release-notes/5.0-upgrade-standalone/)
1. `make scale-down` and ensure all containers are stopped. It's also a good idea to watch the logs for the `db` container ensuring the shutdown was "clean".
1. `make deploy-db` and ensure configs are applied to the deployment
1. `make scale-up` and ensure all containers start back up. It's also a good idea to watch the logs for the `db` container ensuring the startup was "clean" and the new version is actually running.
1. Verify that the running MongoDB version is in fact the version you expect. Connecting to staging or production mongo instance using the `mongosh` client should confirm this (the server version is printed when you connect). You can also check the image name of the deployment you are inspecting.
1. Run the `db.adminCommand( { getParameter: 1, featureCompatibilityVersion: 1 } )` command to verify that feature version is set to the previous db version
1. Ensure a recent backup of the mongo databases was successful and is available in case a restore/revert is necessary.
1. To perform the actual upgrade run `db.adminCommand( { setFeatureCompatibilityVersion: "5.0" } )` Change the version to the desired new version number. This operation may take some time to complete as it may trigger an internal data migration on existing collections.
1. Run the `db.adminCommand( { getParameter: 1, featureCompatibilityVersion: 1 } )` command again to verify that feature version is now set to the newly upgraded version.
