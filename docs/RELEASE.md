# Application Deployment and Release Guide #

This guide describes our Release and Deployment processes.

# Release Naming Conventions and Cadence

The Language Forge project is under active development and as a project team we value shipping early and shipping often.  In the past we have used a form of semantic versioning for our version names, however moving forward our releases will be [publicized on our community support site](https://community.software.sil.org/c/language-forge/20) as the YYYY-MM release. We will publish a summary of changes on our community site, once a month for all releases/changes that occurred during the prior month.

Releases are tagged in Git using the naming convention `vYYYY-MM-DD` and Docker images as `YYYY-MM-DD` (omitting the preceding `v`).  In the event that we release twice in a single day, the release shall be named `YYYY-MM-DDb`, containing a distinguishing trailing letter.
## Application deployment ##

Language Forge is built to run in a containerized environment.  Kubernetes is our chosen runtime platform for production.  Deployments are automated under the right circumstances using GitHub Actions.

### Staging (QA) ###

[qa.languageforge.org](https://qa.languageforge.org)

Staging deployments can be manually run with `VERSION_APP=<some-docker-tag-or-semver> VERSION_PROXY=<some-docker-tag-or-semver> VERSION_NEXT_APP=<some-docker-tag-or-semver> VERSION_LFMERGE=<some-docker-tag-or-semver> make deploy-staging`.

Current workflow:
1. merge PR into or make commits on `develop` branch
1. this will kick off the GHA (`.github/workflows/staging.yml`) to build, test and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags) and deploy this code to the staging environment at https://qa.languageforge.org

### Production ###

[languageforge.org](https://languageforge.org)

Production deployments can be manually run with `VERSION_APP=<some-docker-tag-or-semver> VERSION_PROXY=<some-docker-tag-or-semver> VERSION_NEXT_APP=<some-docker-tag-or-semver> VERSION_LFMERGE=<some-docker-tag-or-semver> make deploy-prod`.

Current workflow:
1. merge from `develop` into `master`
1. "Draft a new release" on https://github.com/sillsdev/web-languageforge/releases with a `vYYYY-MM-DD` tag format
1. "Publish" the new release
1. this will kick off the GHA (`.github/workflows/production.yml`) to build, test and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags) and deploy this code to the production environment at https://languageforge.org

### Revert ###
Various tagged images are maintained in Docker Hub.  If you need to revert to a previous version, you can do so by running the deployments scripts with the appropriate permissions or utilizing the Kubernetes UI to change the image of a deployment at any time.

### Backup/Restore ###
Backups will be established automatically by LTOps and utilized by LF through the `storageClassName` property in a Persistent Volume Claim.  This storage class provided by LTOps establishes both a frequency and retention for a backup.  Any time a restoration is needed, the LF team will need to coordinate the effort with LTOps.  The process of restoring from a point in time will require the application be brought down for maintenance.  The process will roughly follow these steps:
1. Notify LTOps of the need to restore a backup (App team)
1. Coordinate a time to bring the app down for maintenance (LTOps/App team)
1. Scale the app down (LTOps/App team)
1. Initiate the Backup restore (LTOps)
1. Notify app team of the restoration completion (LTOps)
1. Scale the app up (LTOps/App team)
1. Test the app (App team)
1. Communicate maintenance completion
