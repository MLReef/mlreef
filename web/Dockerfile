# The Node Version has to correspond with the node version in the gitlab-ci pipeline
FROM node:10.19.0-alpine

# set working directory
COPY . /app
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN npm install .

# start app
ENTRYPOINT ["npm", "start"]
