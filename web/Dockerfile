# The Node Version has to correspond with the node version in the gitlab-ci pipeline
FROM node:10.19.0-alpine

# set working directory
COPY . /app
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN npm install --global --silent react-scripts
RUN npm install --global --silent create-react-app@latest
RUN npm install --global --silent react-scripts@3.0.1
RUN npm install .

# Run MLReef's UNIT Tests
RUN npm test

# start app
ENTRYPOINT ["npm", "start"]
