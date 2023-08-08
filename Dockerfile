# Use the official Node.js 16 LTS image as the base image
FROM node:16 AS node

# Set the working directory inside the container
WORKDIR /workspace

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code
COPY ./src ./src
COPY .env ./

# Expose port 8000 (the port that your Express app listens to)
EXPOSE 8000

# Start the Node.js app
CMD [ "npm", "start" ]
