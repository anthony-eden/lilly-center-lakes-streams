# [SITENAME]

> Description of site here....

| Developer             | Hosting       | CMS         |
| --------------------- | ------------- | ----------- |
| Eden Creative         | DigitalOcean  | Wordpress   |

## Sites

### Production [DO]

    Domain: domain.com
    IPv4: 178.128.159.149

### Staging [DO]

    Domain: domain.edencreative.co
    IPv4: 178.128.159.149

### Local

    Domain: domain.local

## Local Setup

### Requirements

The project assumes you have Node.js and Gulp already installed.

To get Nodje.s you can download it from [nodejs.org](https://nodejs.org/).

Once node is installed you can install Gulp and Bower by running the following commands:

```
npm install -g gulp
```

### Getting Started

1. Create a new project folder, [download](https://wordpress.org/download/) and install Wordpress. 
    ```
    mkdir projectname
    ```

2. Create a new virtual host and database within MAMP. Duplicate `wp-config-sample.php` in the project's root folder, renaming it to `wp-config.php`.

Edit the config file, replacing with your appropriate settings.

3. Create a new Wordpress theme folder for our project, clone the repo, and initialize a new repo. (Note: replace `projectname` with the name of your project)
    ```
    cd projectname/wp-content/themes/projectname
    git clone git@github.com:edencreativeco/eden-wp-kit.git .
    rm -rf .git
    git init
    ```

4. If you have an empty repo created in Github, you can add it to your local repo by adding the git address. This will allow you to push changes to the remote repo for collaboration and deployments.
    ```
    git remote add origin git@github.com:edencreativeco/example.git

    # Push up the repo and its refs for the first time
    git push -u origin --all

    # Push up any tags
    git push origin --tags
    ```

5. Install development dependencies
    ```
    npm install
    ```

### Gulp Commands

```bash
# Starts a development server and watches for changes
gulp

# Builds and compiles for production
gulp build

# Cleans public asset folder
gulp clean

# Compiles stylesheets
gulp styles

# Compiles vendor scripts
gulp vendor

# Compiles JavaScripts
gulp scripts

# Compiles and minifies images via imagemin
gulp images

# Moves static files to the public directory
gulp files

# Moves custom fonts from `src/fonts` to `web/assets/fonts`
gulp fonts

# Moves static assets fonts from `src/static` to `web/assets/fonts`
gulp static
```