master: [![Build Status](https://travis-ci.org/schulcloud/schulcloud-content.svg?branch=master)](https://travis-ci.org/schulcloud/schulcloud-content)
dev: [![Build Status](https://travis-ci.org/schulcloud/schulcloud-content.svg?branch=dev)](https://travis-ci.org/schulcloud/schulcloud-content)
# schulcloud-content-crawler

> Service to gather content from various education sites and providing a search

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Update the submodule

    ```
    cd path/to/schulcloud-content-crawler; npm run-script preinstall
    ```
    
3. Install your dependencies

    ```
    npm install
    ```
    
4. Install the dependencies of the submodule

    ```
    npm run-script postinstall
    ```
    
5. Start your app

    ```
    npm start
    ```
## API

```
/contents                                    # shows 5 results
/contents?title=Binomische%20Formeln         # you can filter for fields
/contents/58355f30c5e8e91d80a0a85e           # if you already now the id, you can access it directly
```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g feathers-cli             # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
