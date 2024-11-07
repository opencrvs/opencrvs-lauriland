# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
#!/bin/bash
set -e

# Reading Names parameters
for i in "$@"; do
    case $i in
    --ssh_host=*)
        SSH_HOST="${i#*=}"
        shift
        ;;
    --ssh_user=*)
        SSH_USER="${i#*=}"
        shift
        ;;
    --ssh_port=*)
        SSH_PORT="${i#*=}"
        shift
        ;;
    --stack=*)
        export STACK="${i#*=}"
        shift
        ;;
    --update-dependencies=*)
        if [ "${i#*=}" = "true" ]; then
          UPDATE_DEPENDENCIES=true
        else
          UPDATE_DEPENDENCIES=false
        fi
        shift
        ;;
    *) ;;
    esac
done

DEPENDENCY_COMPOSE_FILES="$INFRASTRUCTURE_DIRECTORY/docker-compose.dependencies.yml"
APPLICATION_COMPOSE_FILES="$INFRASTRUCTURE_DIRECTORY/docker-compose.app.yml"

get_docker_tags_from_compose_files() {
   COMPOSE_FILES=$1
   SPACE_SEPARATED_COMPOSE_FILE_LIST=$(printf " %s" "${COMPOSE_FILES[@]}")
   SPACE_SEPARATED_COMPOSE_FILE_LIST=${SPACE_SEPARATED_COMPOSE_FILE_LIST:1}
   IMAGE_TAG_LIST=$(cat $SPACE_SEPARATED_COMPOSE_FILE_LIST \
   | grep image: \
   | grep -v ocrvs-base \
   | sed "s/image://")
   IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS=$(echo $IMAGE_TAG_LIST \
   | grep -o "[A-Za-z_0-9]\+:-[A-Za-z_0-9.-]\+" \
   | sort --unique)
   for VARIABLE_NAME_WITH_DEFAULT_VALUE in ${IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS[@]}; do
      IFS=':' read -r -a variable_and_default <<< "$VARIABLE_NAME_WITH_DEFAULT_VALUE"
      VARIABLE_NAME="${variable_and_default[0]}"
      DEFAULT_VALUE=$(echo ${variable_and_default[1]} | sed "s/^-//")
      CURRENT_VALUE=$(echo "${!VARIABLE_NAME}")
      if [ -z "${!VARIABLE_NAME}" ]; then
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$DEFAULT_VALUE/g")
      else
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$CURRENT_VALUE/g")
      fi
   done
   IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES=$(echo $IMAGE_TAG_LIST \
   | sed -E "s/:-[A-Za-z_0-9]+//g" \
   | sed -E "s/[{}]//g")
   echo $IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES \
   | envsubst \
   | sed 's/ /\n/g'
}

# Function to run SSH with configured parameters
configured_ssh() {
  ssh $SSH_USER@$SSH_HOST -p $SSH_PORT $SSH_ARGS "$@"
}

# Pulling Docker images based on the `UPDATE_DEPENDENCIES` flag
if [ "$UPDATE_DEPENDENCIES" = false ]; then
  IMAGE_TAGS_TO_DOWNLOAD=$(get_docker_tags_from_compose_files "$APPLICATION_COMPOSE_FILES")
else
  IMAGE_TAGS_TO_DOWNLOAD=$(get_docker_tags_from_compose_files "$DEPENDENCY_COMPOSE_FILES")
fi

EXISTING_IMAGES=$(configured_ssh "docker images --format '{{.Repository}}:{{.Tag}}'")
for tag in ${IMAGE_TAGS_TO_DOWNLOAD[@]}; do
  if [[ $EXISTING_IMAGES == *"$tag"* ]]; then
    echo "$tag already exists on the machine. Skipping..."
    continue
  fi
  echo "Downloading $tag"
  until configured_ssh "cd /opt/opencrvs && docker pull $tag"; do
    echo "Server failed to download $tag. Retrying..."
    sleep 5
  done &
done
wait