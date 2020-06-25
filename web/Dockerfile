# Welcome to MLReef frontend's dockerfile.
#
# Stage 1: build the React app in production mode
#
# The image must correspond with the image used in bin/npm
FROM node:10.19.0-alpine AS BUILDER

# add npm binaries to shell path
ENV PATH /app/node_modules/.bin:$PATH
# copy the frontend (ecept .dockerignore) to image
COPY . /app
# all following commands will be executed in /app
WORKDIR /app

RUN npm install --global --silent react-scripts             && \
    npm install --global --silent create-react-app@latest   && \
    npm install --global --silent react-scripts@3.0.1
RUN npm install .

# install all NPM packages and compile the react app
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
