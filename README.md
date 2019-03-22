# FindSampo

Main reposity of the FindSampo project.

## Initialization

Before starting ensure that you have node v.10.15 and yarn v.1.15.<br>

In this project yarn is used as a package manager tool. Please avoid using NPM<br>

Yarn initialization instructions: https://yarnpkg.com/en/docs/install<br>

This repository does not contain .env files and these files are needed for building the project.<br>

Please contact pejam.hassanzadeh@aalto.fi for getting an test env file.<br>

After these steps, run command "yarn" then you are ready to run the available scripts.

## Available Scripts

In this project directory, you can run:

### `yarn dev-server`

Runs the app in the development mode.<br>

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build:dev`

Builds the app for development production to the `build` folder.<br>

### `yarn build:prod`

Builds the app for production to the `build` folder.<br>

## Deploy with Docker

### Build
 `docker build -t findsampo_image .`

### Run
 `docker run -d -p 3007:3001 --name findsampo findsampo_image`

### Upgrade
```
docker build -t findsampo_image .
docker stop findsampo
docker rm findsampo
docker run -d -p 3007:3001 --name findsampo findsampo_image
