master: [![Build Status](https://travis-ci.org/schul-cloud/schulcloud-content-crawler.svg?branch=master)](https://travis-ci.org/schulcloud/schulcloud-content-crawler)
dev: [![Build Status](https://travis-ci.org/schul-cloud/schulcloud-content-crawler.svg?branch=dev)](https://travis-ci.org/schulcloud/schulcloud-content-crawler)
# schulcloud-content-crawler
> Service to gather content from various education sites.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    npm install
    ```
3. Start the app

    ```
    npm start
    ```

    The app is available at `http://localhost:8091/`.

## API

```
/fetch                                            # fetch all client content resources
/fetch?exclude=serlo                              # exclude serlo from fetching
/fetch?exclude=antares&exclude=khanacademy        # exclude antares and khanacademy from fetching
```

The JSON response of the API call is logged to the `./fetch.log` file.

## Clients

This repository contains the clients for all external content provider that are used for the content search of the Schul-Cloud. 
Each client must provide a method called `getAll()`. A client should create an array of content objects as defined in the content model and described below. In the end, each client must return a promise.

#### Attributes
A content object should contain as much fields as possible from the following list, although only `originId`, `title`, `url`, and `restrictions` are required.

* **originId** - The id of the content provided by the external source.
* **title** - The title of the content.
* **url** - The (explicit) URL of the content.
* **license** - Array of all licenses that apply. Use URIs if possible or follow a unified schema, e.g., C38 of the Erweitertes Austauschformat (EAF) (ftp://ftp.fwu.de/fwu/eaf/db-eaf.pdf). `null` means that no license applies.
* **description** - The description of the content.
* **contentType** - The type of the content. This has to be a 2-to-4-digit number following the FWU Signatur-Infos (ftp://ftp.fwu.de/fwu/eaf/Signatur-Infos%202015-05.pdf).
* **creationDate** - The date when the content was originally created. This refers to the content itself, not to the Schul-Cloud entity.
* **lastModified** - The date when the content was last modified. This refers to the content itself, not to the Schul-Cloud entity.
* **language** - The language of the content. This has to be a LCID string (e.g., `de-de`).
* **subjects** - Array containing all the subjects the content is suited for. Each subject should follow the [Sachgebietssystematik für die Medienzentren und Bildstellen](http://agmud.de/wp-content/uploads/2013/09/sgsyst-20121219.pdf). `null` means that no subjects could be extracted.
* **targetGroups** - Array of objects representing classes/age groups/… that the content is suited for. This is an array of objects of the following schema:
    ```javascript
    { state: 'HH', grade: '9', schoolType: 'Gymnasium'}
    ```
    `null` means that no target groups could be extracted. If given, at least one attribute (`state`, `schoolType`, or `grade`) must be provided.
* **target** - Currently not used. Designated to describe for which kind of work the content is suited. Could follow a format like *prefix 0 for pupils, 1 for teachers, and suffix 0 for exercise, 1 for exam, 2 for repetition*.
* **tags** - Array of tags/keywords (strings) that describe what the content is about. `null` means that no tags could be extracted.
* **restrictions** - An object defining the restrictions on accessing und using the content, i.e., describes FSK/USK and license restrictions. This is an array of objects of the following schema: 
    ```javascript
    {
      minAge: 14, // 14 is the minimum required age to access the content
      location:
      [
        state: 'HH', // state in which this content can be accessed
        county: '', // same for county (Landkreis); as always: keep empty when it does not apply, not used yet
        schoolDistrict: '' // same for school district, not used yet
      ]
    }
    ```
    `null` means that there are no restrictions. If given, at least `location` or `minAge` must be provided.

* **relatedRessources** - Array of objects containing the `originId` and `relationType` of the related resource:
    ```javascript
    { originId: 'x3abcde', relationType: 'series' }
    ```

#### Model Extension

Only necessary in rare cases. **Please double check if this is inevitable!**

When adding new attributes to the content model, the following files need to be adapted:

1. MongoDB ccontent model (`models/contents.js`)
2. Model documentation in this readme (`README.md`)
3. Follow the instructions [here](https://github.com/schul-cloud/schulcloud-content-api#extension-of-the-content-model)

#### Sample Client
A client has to parse its contents to learning objects like in the following example in the Serlo client:
```javascript
const contentModel = require('./../models/contents');

// ...

function parseLearningObjects(response, contentType) {
    var content = JSON.parse(response);
    return content.map(function (serialization) {
        var subjectsAndTargetGroups = parseCategories(serialization.categories);
        var data = {
            originId: serialization.guid,
            title: serialization.title,
            url: urljoin(BASE_URL, serialization.link),
            license: ['https://creativecommons.org/licenses/by-sa/4.0/'],
            language: 'de-de',
            description: serialization.description,
            contentType: CONTENT_TYPE_STANDARD_NAMES[contentType],
            subjects: subjectsAndTargetGroups.subjects,
            targetGroups: subjectsAndTargetGroups.targetGroups,
            tags: Object.keys(serialization.keywords).map(function (x) {
                return serialization.keywords[x];
            }),
            restrictions: null,
            lastModified: moment.tz(serialization.lastModified.date, serialization.lastModified.timezone).toDate()
        };

        return contentModel.getModelObject(data);
    });
}
```

#### Contribution

Anyone planning on adding another client should try to follow the Serlo client as an example of how a client should look like (`clients/serlo`).

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
