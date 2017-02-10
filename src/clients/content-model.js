'use strict';

const contentModel = {
    schema: {
        originId: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String, required: true },
        license: [{ type: String }],
        description: { type: String },
        contentType: { type: Number },
        creationDate: { type: Date },
        lastModified: { type: Date },
        language: { type: String },
        subjects: [{ type: String }],
        targetGroups: [{ state: String, grade: String, schoolType: String, _id: false }],
        target: { type: String },
        tags: [{ type: String }],
        restrictions: [{ location: [{ state: String }], minAge: Number, _id: false }],
        relatedResources: [{ originId: String, relationType: String, _id: false }],
        popularity: { type: Number, default: 0 },
        thumbnailUrl: { type: String },
        editorsPick: { type: Boolean, default: false }
    },
    getModelObject: function (data) {
        let modelObject = {};
        Object.keys(this.schema).forEach(field => {
            if(data[field] !== undefined) {
                modelObject[field] = data[field];
            }
            else if(this.schema[field].default != null) {
                modelObject[field] = this.schema[field].default;
            }
            else if (this.schema[field].required) {
                throw new Error (field + " is required");
            }
        });

        return modelObject;
    }
};

module.exports = contentModel;
