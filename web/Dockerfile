FROM node:12.2.0-alpine

# set working directory
COPY . /app
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
ENV BACKEND_INSTANCE_URL=http://backend:8080
ENV REACT_APP_BACKEND_INSTANCE_URL=http://backend:8080
ENV GITLAB_URL=http://gitlab:80

# add global node modules
ADD node_modules_global /usr/local/lib/node_modules
RUN npm install --silent .

# start app
ENTRYPOINT ["npm", "start"]
