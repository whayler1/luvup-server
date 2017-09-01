FROM node:8.4.0

# Set a working directory
WORKDIR /usr/src/app

# RUN yarn build

COPY ./build/package.json package.json
COPY ./build/yarn.lock yarn.lock

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

CMD [ "node", "server.js" ]
