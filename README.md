# gitlab-webhook-publish

This project consist of a lite server using gitlab hooker mechanism to easily synchronise a npm package hosted
on gitlab with a repository server.

# How it works

It is very simple. Using gitlab system hooker `project_create`, we can detect when a new repository is created and
then add a gitlab webhooker which send a post request to the webhook server which then execute the `npm publish` command.

# Install

You can install it using `npm install -g gitlab-webhook-publish` or downloading this repository.
You have then to edit the config file `config/local.json`.

    {
      "webhooker": {
        "host": "localhost",
        "port": 3000,                        /* Port of the server */
        "filter": {
          "namespace" : "^local-app$",       /* Regex to filter using project namespace */
          "branch" : "^refs\/heads\/master$" /* Regex to filter using project branch */
        }
      },
      "gitlab": {
        "url": "http://localhost:80",        /* The url of the gitlab server */
        "token": "dBqAHFnJsgMPTzzP6qGu",     /* The admin token (used to add webhooks) */
        "admin_login": "root",               /* The admin login (used to repo ddl)  */
        "admin_password": "password"         /* The admin password */
      },
      "npm_registry": {
        "url": "https://registry.npmjs.org", /* Url of the npm registry */ 
        "login": "iprotectmyaccount",        /* The account login (used to to publish) */  
        "password": "12345678",              /* The account password */  
        "email": "name@provider.com"         /* The account email */  
      }
    }

To finish the installation, you have to add (only ONE time), a system hooker on gitlab (if you have a programmatically way to add a system hooker on gitlab, please contact me).

To do that, go to `Admin Area > Hooks`. In `URL` input, add `http://<WEBHOOKER_HOST>:<WEBHOOKER_PORT>/project_create`. You can left `Secret Token` input empty. Check `Push events` checkbox. You can enable or not the `SSL Verification` if you want.

Then ENJOY !
