---
title: Building an Image Upload App with Angular 4, NodeJS, PostgreSQL, and Amazon S3 – Part 2
date: "2017-06-30T03:55:49Z"
cover: "https://unsplash.it/1280/500/?image=1076"
author: "matthew"
category: "tech"
tags:
    - programming
    - stuff
    - other
---

## Building a Node/Express User service with JWT authentication

In [Part 1](/20170630-image-upload-app-part1) we laid the groundwork for building our web services by setting up Docker containers. 

Part 2 consist of defining and creating a user table in our PostgreSQL data store and then building a user service that other services and our user interface can talk to. We’ll be using an ORM called knex to handle our database queries. 

**Requirements**

  * Users should be able to register and login
  * We will be using JWT based security to secure our application and the service will be responsible for generating the tokens based on user credentials.
  * Our images service will also communicate with the user service to validate that a user is signed in. If we were creating other services they could also make use of the user service.


In order to follow along with building the service in this article you’ll need to have completed Part 1 or clone the git repository and checkout the Part 2 tag in addition to having Docker installed and running locally: 
```
git clone https://github.com/mbrown333/angular4-node-image-upload-app.git 
cd angular4-node-image-upload-app 
git checkout tag/Part2 
docker-compose up
```

## Database Table Setup

One more thing we’ll need is the knex cli for creating migrations. Use the command `npm i -g knex-cli` to install. 

Next step will be to add a knexfile to configure the ORM that we’ll be using to build out our service: 

_/users-api/knexfile.js_ 
```
const path = require('path'); 

module.exports = { 
  development: { 
    client: 'pg', 
    connection: process.env.DATABASE_URL, 
    migrations: { 
      directory: path.join(__dirname, 'db', 'migrations') 
    } 
  } 
}
```

Here we’ve created a config object for our development object. We’re using the ‘pg’ client which is for PostgreSQL. Knex can connect to other types of databases and if you take a look in our package.json file you’ll notice that the pg package is included in the dependencies. 

For connection we give the environment variable that we specified the database connection string in the docker-compose.yml file. And then finally we specify a directory (/db/migrations) to store migrations in. 

Now we’re ready to create a migration using the knex-cli. Open up a command prompt in the /users-api folder and enter the following commands: 
```
npm install knex knex migrate:make users
```

This will create a migration file in the /db/migrations folder that has the following structure:
```
exports.up = function(knex, Promise) { 

}; 

exports.down = function(knex, Promise) { 

}; 
```

We’ll be putting the changes we want to make in the up function, and a way to reverse those changes in the down function. What we want to accomplish with this migration is to create our user table and define the structure. 
```
exports.up = (knex, Promise) => { 
  return knex.schema.createTable('users', table => { 
    table.increments(); 
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()')); 
    table.string('username').unique().notNullable(); 
    table.string('password').notNullable(); 
  }); 
}; 

exports.down = function(knex, Promise) { 
  return knex.schema.dropTable('users'); 
};
```

_/users-api/db/db.js_
```
const config = require('../knexfile.js'); 
const knex = require('knex')(config['development']); 

module.exports = knex; 

knex.migrate.latest(['development']);
```

Pretty straightforward here, we’re just creating a users table to store username and password and an id field. Then in the db.js file we pull our config and knexfile and run the migration we just created. Now that we have our data store defined we’re ready to create our routes. We’ll create a file in the /users-api/routes folder to define our user routes. We’ll be creating three routes to register a user, login a user, and verify a user is authenticated. 

_/users-api/routes/users.js_
```
const express = require('express'); 
const router = express.Router(); 
const knex = require('../db/db'); 
const moment = require('moment'); 
const jwt = require('jwt-simple'); 
const bcrypt = require('bcryptjs'); 

router.post('/user', async (req, res) => { 
  try { 
    const salt = bcrypt.genSaltSync(); 
    const hash = bcrypt.hashSync(req.body.password, salt); 
    
    const user = await knex('users') 
      .insert({ username: req.body.username, password: hash }) 
      .returning('*'); 
      
    res.json({ success: true, token: encode(user[0])}); 
  } catch (err) { 
    res.status(500).json({ 
      success: false, 
      errorMessage: err 
    }); 
  } }); 
  
  function encode(user) { 
    const token = { 
      exp: moment().add(7, 'days').unix(), 
      iat: moment().unix(), 
      sub: user.id 
    }; 
    
    return jwt.encode(token, process.env.TOKEN_SECRET); 
  } 
  
  module.exports = router;
```

This first one is the route for registering a new user. A user will enter a username and password and then use bcrypt to generate a hash and store the hash as a password instead of the plain text version. You’ll see using knex to generate SQL queries is very straightforward. We specify the table ‘users’ and then pass the object to store. 

Finally the newly created user will be returned so that we can use the jwt-simple module to generate a JWT token to return in the JSON reponse body. Now that users can register they need to have the ability to login. 

_/users-api/routes/users.js_ 
```
router.post('/login', async (req, res) => { 
  try { 
    const credentials = { 
      username: req.body.username, 
      password: req.body.password 
    }; 
    
    const user = await knex('users')
      .where({ username: credentials.username })
      .first(); 
      
    if (!user || !bcrypt.compareSync(credentials.password, user.password)) { 
      throw new Error('Incorrect password'); 
    } 
      
    res.json({ success: true, token: encode(user) }); 
  } catch (err) { 
    res.status(500).json({ status: 'error', message: err }); 
  } 
});
```

 We’ll use the username passed in by the user to find a user record in the data store and then let bcrypt test if the entered password matches the hash stored in the database. Then if it does, a token is created and passed back in the response body. 
 
 _/users-api/routes/users.js_ 
 ```
 router.get('/user', isAuthenticated, (req, res) => { 
   res.json({ status: 'success', user: req.user }) 
  }); 
   
  function decode(token, callback) { 
    const decodedJwt = jwt.decode(token, process.env.TOKEN_SECRET); 
    const now = moment().unix(); 
    
    if (now > decodedJwt.exp) { 
      callback('Token has expired.'); 
    } else { 
      callback(null, decodedJwt); 
    } 
  } 
  
  function isAuthenticated(req, res, next) { 
    if (!(req.headers && req.headers.authorization)) { 
      return res.status(401).json({ errorMessage: 'Unauthorized'} ); 
    } 
    
    const token = req.headers.authorization; 
    decode(token, async (err, payload) => { 
      try { 
        if (err) { 
          return res.status(401).json({ errorMessage: 'Token expired'} ); 
        } 
        
        const user = await knex('users').where({ id: parseInt(payload.sub, 10) }).first() 
        req.user = user.id; 
        
        return next(); 
      } catch (err) { 
        res.status(500).json({ errorMessage: err }); 
      } 
    }) 
  }
  ```

Finally we need a route to verify that a user is logged in and include their id in the response if successful. Using the bcrypt and jwt-simple Node modules to do the heavy lifting you can see that it’s fairly straightforward to create basic JWT authentication for Node services. Putting it all together, here is our final routes file: 
  
_/users-api/routes/users.js_
```
const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const moment = require('moment');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

router.post('/user', async (req, res) => {
    try {
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(req.body.password, salt);

        const user = await knex('users')
                        .insert({ username: req.body.username, password: hash })
                        .returning('*');

        res.json({ success: true, token: encode(user[0])});
    } catch (err) {
        res.status(500).json({ success: false, errorMessage: err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const credentials = {
            username: req.body.username,
            password: req.body.password
        };

        const user = await knex('users').where({ username: credentials.username }).first();
        if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
            throw new Error('Incorrect password');
        }

        res.json({ success: true, token: encode(user) });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err });
    }
});

router.get('/user', isAuthenticated, (req, res) => {
    res.json({
        status: 'success',
        user: req.user
    })
});

function encode(user) {
    const token = {
        exp: moment().add(7, 'days').unix(),
        iat: moment().unix(),
        sub: user.id
    };

    return jwt.encode(token, process.env.TOKEN_SECRET);
}

function decode(token, callback) {
    const decodedJwt = jwt.decode(token, process.env.TOKEN_SECRET);
    const now = moment().unix();

    if (now > decodedJwt.exp) {
        callback('Token has expired.');
    } else {
        callback(null, decodedJwt);
    }
}

function isAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(401).json({ errorMessage: 'Unauthorized'} );
    }

    const token = req.headers.authorization;
    decode(token, async (err, payload) => {
        try {
            if (err) {
                return res.status(401).json({ errorMessage: 'Token expired'} );
            }

            const user = await knex('users').where({ id: parseInt(payload.sub, 10) }).first()
            req.user = user.id;
            return next();
        } catch (err) {
            res.status(500).json({ errorMessage: err });
        }
    })
}

module.exports = router;
```