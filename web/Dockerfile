# Welcome to MLReef frontend's dockerfile.
#
# Stage 1: build the React app in production mode
#
# The image must correspond with the image used in bin/npm
FROM node:14.16.1-alpine AS BUILDER
ARG CI_COMMIT_REF_SLUG
ARG CI_PIPELINE_ID=-1
ARG CI_PIPELINE_URL="CI URL N/A"
ARG NODE_OPTIONS="--max-old-space-size=2048"

# add npm binaries to shell path
ENV PATH /app/node_modules/.bin:$PATH

# all following commands will be executed in /app
WORKDIR /workdir
# copy the sources to image (except .dockerignore)
ADD . /workdir

# create build.info with build and add build information to React's env variables
RUN echo "Gitlab Pipeline $CI_PIPELINE_ID built on "$(date +%Y-%m-%d\ %H:%M:%S)  > build.info   && \
    echo "build branch was $CI_COMMIT_REF_SLUG"                                 >> build.info   && \
    echo "$CI_PIPELINE_URL"                                                     >> build.info   && \
    cat build.info                                                                              && \
    # Use Gitlab's internal unique job ID as build version. This way versions can be traced back to a specific build.
    echo "SKIP_PREFLIGHT_CHECK=true"                                             > .env         && \
    echo "REACT_APP_VERSION=$CI_PIPELINE_ID"                                    >> .env         && \
    echo "REACT_APP_BUILD_NUMBER=$CI_PIPELINE_ID"                               >> .env         && \
    echo "REACT_APP_BRANCH_NAME=$CI_COMMIT_REF_SLUG"                            >> .env         && \
    echo "REACT_APP_EXTERNAL_URL=https://mlreef.com"                            >> .env         && \
    echo "Time: $(date +%Y-%m-%d\ %H:%M:%S)"                                                    && \
    cat .env


# install all NPM packages and compile the react app
RUN echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    npm install --global --silent react-scripts@3.4.3       && \
    npm ci --silent .                                       && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    # execute tests first, so there should be a halt when compiling if tests fail
    # npm test                                                && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    npm run build                                           && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)"

#
# Stage 2: Use nginx for serving the finished production build
#
FROM nginx:latest AS PROD
# Copy frontend production build from the NPM stage
# This path has to correspond to the configuration in nginx_default.conf
COPY --from=BUILDER /workdir/build /usr/share/nginx/html

# Add nginx configuration. Note the name change of the file
ADD nginx_default.conf /etc/nginx/conf.d/default.conf
RUN chmod 777 /etc/nginx/conf.d/default.conf
