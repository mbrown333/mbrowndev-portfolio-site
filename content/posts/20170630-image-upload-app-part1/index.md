---
title: Building an Image Upload App with Angular 4, NodeJS, PostgreSQL, and Amazon S3 - Part 1
date: "2017-06-30T03:38:25Z"
cover: "https://unsplash.it/1280/500/?image=1079"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

In this four part article we will be building a web application that allows user to upload images and manage those images through the user interface. We will be using NodeJS to build a couple of RESTful APIs, PostgreSQL for a data store, and an Angular 4 front end. 

We’ll also be using Docker to containerize the databases, Node services, and the UI server. Also for file storage we will be using Amazon S3. I’ve tried to simplify this example as much as possible, but there are still quite a few steps to go through to build our application. Here’s an overview of what we’ll be tackling in each part of the article: 

  * **Part 1:** Set up our containers with Docker
  * **Part 2:** Build a RESTful web service with NodeJS/Express for users and JWT authentication
  * **Part 3:** Build a RESTful web service with NodeJS/Express for image uploads and store uploads in Amazon S3
  * **Part 4:** Build the User interface using Angular 4

The source code can be found on [github](https://github.com/mbrown333/angular4-node-image-upload-app). 

 **Prerequisites** Install Docker: https://www.docker.com/community-edition Install latest versions of Node/npm Clone the project directory and checkout the Part1 tag: 
 ```
 git clone https://github.com/mbrown333/angular4-node-image-upload-app.git 
 cd angular4-node-image-upload-app git checkout tag/Part1
 ```

## Users and Images Databases

Docker is a popular development tool used to create portable and lightweight containers for running applications with all of the dependencies involved. I’m assuming you’re familiar with Docker already, but if not check it out here: https://www.docker.com/. 

The main advantage to using containers is you can run it on any machine and get the exact same behavior from your application. We’ll start by building out our database containers. We will be using PostgreSQL for our data stores.2 

PostgreSQL is an open source relational database. We’ll be using an ORM called knex, but more on that later. Docker makes it very easy to get instances of our databases up and running. First, open up a command prompt in the project repository and change into the `/users-api` and create a directory called `/db`. In that directory we’ll create an SQL script to create the users database. 
_/users-api/db/create.sql_ 
```
CREATE DATABASE users;
```

And then we’ll add the Dockerfile for our user database: 
_/users-api/db/Dockerfile_ 
```
FROM postgres 
ADD create.sql /docker-entrypoint-initdb.d
```
This specifies for Docker to use the postgres image which is already defined. The second lines adds our script for creating the users database within the container when it starts. Adding it to `/docker-entrypoint-initdb.d` ensures that it will get executed when the container boots up. The final piece we need to put in place before starting up our users database connection is the docker-compose.yml file in the project root folder: 

_/docker-compose.yml_ 
```
version: '2.1' 

services: 
  users-db: 
    container_name: users-db 
    build: ./users-api/db 
    ports: 
      - '5433:5432' 
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres 
    healthcheck: 
      test: exit 0
```

We’ll add more to this file as we go, but let’s note a few things here. We give the container the name users-db which we’ll use here in a moment to start the container. 

We’re exposing the 5432 port (default for PostgreSQL) on the container to port 5433 on our host machine. And we’re declaring the PostgreSQL default admin username and password for the container. 

Now let’s get our first container up and running. From a command prompt in the root folder of our project enter: `docker-compose up --build -d users-db`. To see the status of all running containers use the command `docker-compose ps`. 

Some other useful commands: Tail container logs: `docker-compose logs -f users-db` 
Open up a bash in a container: `docker-compose run users-db bash` (then `exit` to close) 

Our container is now running in the background. Easy enough right? We’ll follow the same steps to kick off our images database. 

_/images-api/db/create.sql_ 
```
CREATE DATABASE images;
```

_/images-api/db/Dockerfile_ 
```
FROM postgres 
ADD create.sql /docker-entrypoint-initdb.d
``` 

_/docker-compose.yml_ 
```
version: '2.1' 

services: 
  users-db: 
    container_name: users-db 
    build: ./users-api/db 
    ports: 
      - '5433:5432' 
    environment: 
      - POSTGRES_USER=postgres 
      - POSTGRES_PASSWORD=postgres 
    healthcheck: 
      test: exit 0 
  images-db: 
    container_name: images-db 
    build: ./images-api/db 
    ports: 
      - '5434:5432' 
    environment: 
      - POSTGRES_USER=postgres 
      - POSTGRES_PASSWORD=postgres 
    healthcheck: 
      test: exit 0
``` 

Very similar to before. Only real change is we give our image database container the name images-db and connect it to the 5434 host port. And now we’re ready to kick off this container as well: `docker-compose up --build -d images-db`.

And then there were two. If we run the `docker-compose ps` command again we’ll see the following if all went well: 
```
Name Command State Ports 
-------------------------------------------------------------------------- 
images-db docker-entrypoint.sh postgres Up 0.0.0.0:5434->5432/tcp 
users-db docker-entrypoint.sh postgres Up 0.0.0.0:5433->5432/tcp 
```

## Users and Images NodeJs/Express Services

Now that we have our database ready to go, we’ll move on to our two services. We’ll start with our users service first, but as with the database containers both services will look similar. 

_/users-api/Dockerfile_ 
```
FROM node:latest 

# set working directory 
RUN mkdir /usr/src/app 
WORKDIR /usr/src/app 

# add `/usr/src/node_modules/.bin` to $PATH 
ENV PATH /usr/src/app/node_modules/.bin:$PATH 

# install and cache app dependencies 
ADD package.json /usr/src/app/package.json 
RUN npm install 

# start app 
CMD ["npm", "start"]
```

There’s a little more to this Dockerfile than what we saw with the databases. We’re using the node image from Docker, setting up a directory for our application on the container machine, adding the node_modules folder to the PATH, and then installing all of our npm dependencies. After all this is complete, the container will run npm start which will kick off the node server. If you look in the package.json we have specified `nodemon server.js` which will run the server and automatically restart it if it errors out for any reason. 

Now we’ll add our users-api to the docker compose yaml file: 

_/docker-compose.yml_ 
```
 .. 
  users-api: 
    container_name: users-api 
    build: ./users-api/ 
    volumes: 
      - './users-api:/usr/src/app' 
      - './users-api/package.json:/usr/src/package.json' 
      - /usr/src/app/node_modules 
    ports: 
      - '3000:3000' 
    environment: 
      - DATABASE_URL=postgres://postgres:postgres@users-db:5432/users 
      - NODE_ENV=${NODE_ENV} \- TOKEN_SECRET=ICzX8uISDW9Bv2ZcsPUbeZx8tpVa6ajS 
    depends_on: 
      users-db: condition: service_healthy 
    links: 
      - users-db
```