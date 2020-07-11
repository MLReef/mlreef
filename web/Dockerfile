# Welcome to MLReef frontend's dockerfile.
#
# Stage 1: build the React app in production mode
#
# The image must correspond with the image used in bin/npm
FROM node:10.19.0-alpine AS BUILDER
ARG CI_COMMIT_REF_SLUG
ARG CI_PIPELINE_ID=-1
ARG CI_PIPELINE_URL="CI URL N/A"

# add npm binaries to shell path
ENV PATH /app/node_modules/.bin:$PATH

# copy the frontend (ecept .dockerignore) to image
COPY . /app
# all following commands will be executed in /app
WORKDIR /app

# create build.info with build and add build information to React's env variables
RUN touch build.info
RUN echo "Gitlab Pipeline $CI_PIPELINE_ID built on "$(date +%Y-%m-%d\ %H:%M:%S) >> build.info
RUN echo "build branch was $CI_COMMIT_REF_SLUG"           >> build.info
RUN echo "$CI_PIPELINE_URL"                               >> build.info
RUN cat build.info


# Use Gitlab's internal unique job ID as build version. This way versions can be traced back to a specific build.
RUN touch .env
RUN echo "SKIP_PREFLIGHT_CHECK=true"                           >> .env
RUN echo "REACT_APP_VERSION=$CI_PIPELINE_ID"                   >> .env
RUN echo "REACT_APP_BUILD_NUMBER=$CI_PIPELINE_ID"              >> .env
RUN echo "REACT_APP_BRANCH_NAME=$CI_COMMIT_REF_SLUG"           >> .env
RUN if [ "$CI_COMMIT_REF_SLUG" = "master" ]; then                          \
      echo "REACT_APP_NO_AUTH_REDIRECT=https://about.mlreef.com"  >> .env; \
    fi
RUN cat .env


# install all NPM packages and compile the react app
RUN npm install --global --silent react-scripts             && \
    npm install --global --silent create-react-app@latest   && \
    npm install --global --silent react-scripts@3.0.1
RUN npm install .

# execute tests first, so there should be a halt when compiling if tests fail
RUN npm test
RUN npm run build
RUN ls -a

#
# Stage 2: Use nginx for serving the finished production build
#
FROM nginx:latest
# Copy frontend production build from the NPM stage
# This path has to correspond to the configuration in nginx_default.conf
COPY --from=BUILDER /app/build /usr/share/nginx/html
# Copy the test coverage report to the final stage
# The CI pipeline later extracts this report and makes it available in Gitlab
COPY --from=BUILDER /app/coverage /usr/share/coverage

# Add nginx configuration. Note the name change of the file
ADD nginx_default.conf /etc/nginx/conf.d/default.conf
RUN chmod 777 /etc/nginx/conf.d/default.conf
