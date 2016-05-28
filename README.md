# gitlab-webhook-publish

This porject consist of a lite server using gitlab hooker mechanism to easily synchronise a npm package hosted
on gitlab with a repository server.

# How it works

It is very simple. Using gitlab system hooker `project_create`, we can detect when a new repository is created and
then add a gitlab webhooker whichs send a post request to the webhook server whichs then execute the `npm publish` command.

# Install

You can install it using `npm install -g gitlab-webhook-publish` or downloading this repository.
You have then to edit the config file `config/local.json`.

    {
      "webhooker": {
        "host": "localhost",
        "port": 3000,                           /* Port of the server */
        "filter": {
          "namespace" : "^local-app$",          /* Regex to filter using project namespace */
          "branch" : "^refs\/heads\/master$"    /* Regex to filter using project branch */
        }
      },
      "gitlab": {
        "url": "http://localhost:80",           /* The url of the gitlab server */
        "token": "dBqAHFnJsgMPTzzP6qGu",        /* The admin token (used to add webhooks) */
        "admin_login": "root",                  /* The admin login (used to downlaod repo and process it */
        "admin_password": "password"            /* The admin password (same as admin_login) */
      },
      "npm_registry": {
        "url": "https://registry.npmjs.org",    /* Url of the npm registry */ 
        "login": "iprotectmyaccount",           /* The account login (used to to publish) */  
        "password": "12345678",                 /* The account password (same as login) */  
        "email": "name@provider.com"            /* The account email (same as login) */  
      }
    }