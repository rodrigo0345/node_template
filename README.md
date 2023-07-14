# How the template works

## Introduction

This repo was made to help me build node applications faster, as it is something that I do often and that I don't like to configure everytime.
With that said, it includes file uploads, authentication using passport and a basic create and read enpoint for better undertanding how everything is laid out.
The base configuration comes with MySQL and Redis installed, but this can be adjusted at anytime in the folder /src/databases/ in the constructor of the class.

## Instalation and usage

**Prerequisite: node mysql redis**

Simple enough, clone the repo into your computer

```bash
git clone git@github.com:rodrigo0345/node_template.git
```

Install all the dependencies

```bash
npm i
```

And the basic of it is done.
Because we are using redis and mysql, you will also need to install its respective clients up and running **or** you can use docker-compose to spin up everything for you!

**Prerequisite: docker**

Windows

```bash
docker compose up --build
```

Linux

```bash
docker-compose up --build
```

And once you are done use the command bellow to quit all the containers:

Windows

```bash
docker compose down
```

Linux

```bash
docker-compose down
```

For additional configuration, don't forget to change the name of the .env.example to .env and mess around with the values for your use case.

## File structure:

    - .devcontainer # Optional and used only for Visual Studio Code
    - .vscode # Optional and used only for Visual Studio Code
    - public # here are all the things that can be accessed by anyone, simply go to <running_uri>/public/<file>
    - src
        - common # contains initial configs
        - controllers
            - auth
            - image
            - posts
        - databases
        - routes
        - types # helps with defining types that are gonna be used throughout the app and/or in the database
        - utils # random stuff that might be usefull

## Controllers and Routes

These two are heavily connected between one another because the route simply specifies the routes, the controllers define what is gonna be executed in said route.

### For example

routes contains this files:

    - auth.ts
    - image.ts
    - posts.ts

inside the file (e.g auth.ts) we have:

```js
authRouter.post('/register', postRegister);

authRouter.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(ApiSuccess('Logged in'));
});

authRouter.get('/user', protectRoute, getUser);
```

thus, controllers are gonna contain:

    - auth (directory)
        - getUser.ts # the acctual implementation of getUser specified above
        - postRegister.ts
    - image (directory)
    - posts (directory)

## Types

This folder is meant to declare all the types used throught the aplication that are also stored on the database.
There is one special file called db.ts that is responsible for creating a table for each type used there.

| :exclamation: This is very important |
| ------------------------------------ |

If you see this error message while initiating your app:

```
File at @types/<filename> does not exist
```

It indicates that:

```ts
{
    filename: 'user.ts', <----
    name: 'users',
    createTable: `
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT UNIQUE,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(10) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                deleted BOOLEAN NOT NULL DEFAULT FALSE,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            );`,
    insertTable: `
            INSERT INTO users (name, role, email, password)
            VALUES (?, ?, ?, ?);`,
  },

```

The file called what you specified in .filename does not exist inside the folder types!