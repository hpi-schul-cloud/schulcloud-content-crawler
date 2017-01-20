'use strict';

const request = require('request-promise');

const contentModel = require('./../content-model');
const helper = require('./../_helper/helper');

const API_URL = 'https://de.khanacademy.org/api/v1/topictree';

const CONTENT_TYPE_TOPIC = 'Topic';
const CONTENT_TYPE_VIDEO = 'Video';
const CONTENT_TYPE_STANDARD_NAMES = {};
CONTENT_TYPE_STANDARD_NAMES[CONTENT_TYPE_TOPIC] = 50;
CONTENT_TYPE_STANDARD_NAMES[CONTENT_TYPE_VIDEO] = 5501;

const RELATED_SERIES_TYPE = 'series';
const RELATED_SERIES_EPISODE_TYPE = 'episode';
const RELATED_PREVIOUS_EPISODE = 'prev';
const RELATED_NEXT_EPISODE = 'next';

let client = {
    getAll
};

//member functions
function getAll() {
    return request.get(API_URL)
        .then((response) => {
            let tree = JSON.parse(response);

            // Remove first child node, as it contains copies of most recent contents
            let topicRoots = tree.children.slice(1, tree.children.length);
            let results = topicRoots
                .map(root => parseNode(root))
                .reduce((x,y) => x.concat(y));

            return removeDuplicates(results);
        });
}


//helper functions
//recursive
function parseNode(node, subject, subSubjects) {
    subject = subject || node.translated_title;
    if(subSubjects != null)
        // Clone array so that modifications do not affect other calls
        subSubjects = subSubjects.slice(0);
    else
        subSubjects = [];

    if(node.children.filter(child => child.kind == CONTENT_TYPE_VIDEO).length > 0) {
        // If node has only video children, it is stored as series
        return parseSeries(node, subject, subSubjects, node.id);
    }
    else if (node.kind === CONTENT_TYPE_TOPIC) {
        // If node is topic node, recursively parse children nodes
        if (node.children.length == 0)
            return [];

        if (node.translated_title != subject)
            subSubjects.push(node.translated_title);

        return node.children
            .map((entity) => parseNode(entity, subject, subSubjects))
            .reduce((x, y) => x.concat(y));
    }
    else {
        // If node is a leaf, transform and return it to content model
        return [transformToContentModel(node, subject, subSubjects)];
    }
}

function parseSeries(root, subject, subSubjects, seriesId) {
    let models = [];

    // Series model
    let relatedResources = root.children.map(child => ({
        type: RELATED_SERIES_EPISODE_TYPE,
        originId: child.id
    }));
    let model = transformToContentModel(root, subject, subSubjects, relatedResources);
    models.push(model);

    // Video models
    for(let i = 0; i < root.children.length; i++) {
        let relatedResources = [{
            type: RELATED_SERIES_TYPE,
            originId: seriesId
        }];
        if(i > 0)
            relatedResources.push({
                type: RELATED_PREVIOUS_EPISODE,
                originId: root.children[i - 1].id
            });
        if(i < root.children.length - 1)
            relatedResources.push({
                type: RELATED_NEXT_EPISODE,
                originId: root.children[i + 1].id
            });

        let model = transformToContentModel(root.children[i], subject, subSubjects, relatedResources);
        models.push(model);
    }

    return models;
}

function transformToContentModel(node, subject, subSubjects, relatedResources) {
    let contentType = CONTENT_TYPE_STANDARD_NAMES[node.kind];

    // Parse dates, if present
    let creationDate = null;
    if(node.date_added)
        creationDate = new Date(node.date_added);
    let lastModified = null;
    if(node.creation_date)
        lastModified = new Date(node.creation_date);

    // Build tags from keyword, sub-subjects and concept tags, if present
    let tags = subSubjects || [];
    if(node.keywords)
        tags = tags.concat(node.keywords.split(',').filter(keyword => keyword != ''));
    if(node.concept_tags_info)
        tags = tags.concat(node.concept_tags_info.map(tag => tag.display_name));


    let model = {
        originId: node.id,
        title: node.title,
        url: node.ka_url,
        license: [node.license_url],

        description: node.description,
        type: contentType,
        creationDate: creationDate,
        lastModified: lastModified,
        language: node.translated_youtube_lang,
        subjects: helper.getSubjects([subject]),
        tags: tags,
        restrictions: null,
        relatedResources: relatedResources
    };

    return contentModel.getModelObject(model);
}

function removeDuplicates(items) {
    let seenKeys = new Set();
    return items.filter(function(item) {
        let key = item.originId;
        let isNew = !seenKeys.has(key);
        seenKeys.add(key);

        return isNew;
    });
}

module.exports = client;
