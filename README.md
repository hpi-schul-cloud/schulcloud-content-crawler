master: [![Build Status](https://travis-ci.org/schulcloud/schulcloud-content-crawler.svg?branch=master)](https://travis-ci.org/schulcloud/schulcloud-content-crawler)
dev: [![Build Status](https://travis-ci.org/schulcloud/schulcloud-content-crawler.svg?branch=dev)](https://travis-ci.org/schulcloud/schulcloud-content-crawler)
# schulcloud-content-crawler
> Service to gather content from various education sites

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

## API

```
/fetch                                            # fetch all client content resources
/fetch?exclude=serlo                              # exclude serlo from fetching
/fetch?exclude=antares&exclude=khanacademy        # exclude antares and khanacademy form fetching
```

## Clients

This repository contains the clients for all external content provider that are used for the content search of the Schul-Cloud. 
Each client should provide a method called getAll(). A client should create an array of content objects as defined in the content-model and described below. In the end, each client should return a promise.

#### Attributes
A content object should contain as much fields as possible from the following, although only `originId`, `title`, `url` and `license` are required.

* **originId** - The id of the content provided by the external source
* **title** - The title of the content
* **url** - The URL to the content
* **license** - Array of all licenses that apply *(or is it always possible to just provide one license? In which form? Link? Or ftp://ftp.fwu.de/fwu/eaf/db-eaf.pdf ?)*
* **description** - The description of the content
* **type** - The type of the content. This has to be a 2-to-4-digit number following ftp://ftp.fwu.de/fwu/eaf/Signatur-Infos%202015-05.pdf
* **creationDate** - The date when the content was originally created
* **lastModified** - The date when the content was last modified
* **language** - The language of the content, has to be a LCID string (e.g. de-de)
* **subjects** - Array containing all the subjects the content is suited for. Each subject should follow http://agmud.de/wp-content/uploads/2013/09/sgsyst-20121219.pdf 
* **targetGroups** - Array of classes/age groups/… that the content is suited for. Should follow C10 from ftp://ftp.fwu.de/fwu/eaf/db-eaf.pdf 
* **target** - *(better: LearningTarget?)* Array of elements that describe, for which kind of work the content is suited. Should follow format *(something like prefix 0 for pupils, 1 for teachers, and suffix 0 for exercise, 1 for exam, 2 for repetition)*
* **tags** - Array of tags/keywords that describe, what the content is about (maybe just/also from predefined set?)
* **restrictions** - This is an object of the following schema: 
```javascript
{
  age: 14, // while 14 is the minimum required age to access the content
  location:
  {
    state: ['HH'], // this contains an array in which states this content can be accessed
    county: [], // same for county (Landkreis); as always: keep empty when it does not apply
    schoolDistrict: [] // same for school district
  }
}
```

* **relatedRessources** - Array of objects containing the URL and type of the related resource *(also originId?)*

#### Sample Client
A client has to parse its contents to learning objects like in the following example in the Serlo client:
```javascript
const contentModel = require('./../models/contents');

// ...

function parseLearningObjects(response) {
    let contentType = CONTENT_TYPE_STANDARD_NAMES[response.substring(response.lastIndexOf('/')+1)];
    let content = JSON.parse(response);
    return content.map(serialization => {
        let data = {
            originId: serialization.guid,
            title: serialization.title,
            url: urljoin(BASE_URL, serialization.link),
            license: "https://creativecommons.org/licenses/by-sa/4.0/",
            
            description: serialization.description,            
            type: contentType,
            tags: Object.keys(serialization.keywords).map(x => serialization.keywords[x]),            
            lastModified: moment.tz(serialization.lastModified.date, serialization.lastModified.timezone).toDate(),
        }
        return contentModel.getModelObject(data);
    });
}
```

#### Contribution

Anyone planning on adding another client to this repo can try to follow the Serlo client as an example of how a client should look like (`clients/serlo`).

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
