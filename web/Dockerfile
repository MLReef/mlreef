FROM node:12.2.0-alpine

# set working directory
COPY . /app
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# add global node modules
ADD node_modules_global /usr/local/lib/node_modules
RUN npm install --silent .

# start app
ENTRYPOINT ["npm", "start"]
