#!/bin/sh
# Production deployment step. Intentionally does nothing until IT chooses a method and fills it in.
# It runs only when DEPLOY_ENABLED=true, on the default branch, and only when started by hand in GitLab.
#
# The build output to publish is in dist/ (static files) or the container image
# $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA (when BUILD_IMAGE=true). Pick ONE method below, remove the "exit 1",
# and make sure the tools it needs exist in the job image.
set -eu

: "${DEPLOY_METHOD:?Set DEPLOY_METHOD (static-copy, kubernetes or custom) in GitLab CI/CD variables}"

case "$DEPLOY_METHOD" in
  static-copy)
    # Copy dist/ to a web server or storage bucket that serves $BASE_PATH.
    # Example (needs rsync + SSH key in a protected variable):
    #   rsync -av --delete dist/ "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"
    echo "static-copy is not configured yet: edit deploy/deploy.sh"; exit 1 ;;
  kubernetes)
    # Roll out the image built by the container-image job. Example (needs kubectl + KUBECONFIG):
    #   kubectl -n "$K8S_NAMESPACE" set image deployment/employee-directory web="$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
    #   kubectl -n "$K8S_NAMESPACE" rollout status deployment/employee-directory --timeout=120s
    echo "kubernetes is not configured yet: edit deploy/deploy.sh"; exit 1 ;;
  custom)
    : "${DEPLOY_COMMAND:?Set DEPLOY_COMMAND}"
    sh -c "$DEPLOY_COMMAND" ;;
  *)
    echo "Unknown DEPLOY_METHOD: $DEPLOY_METHOD"; exit 1 ;;
esac
