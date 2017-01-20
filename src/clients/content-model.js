'use strict';

const contentModel = {
    schema: {
        originId: { type: String, required: true},
        title: { type: String, required: true},
        url: { type: String, required: true},
        license: [{ type: String }], // list of all licenses that apply (C30, C32, C34, C38, from ftp://ftp.fwu.de/fwu/eaf/db-eaf.pdf)
        description: { type: String },
        contentType: { type: String }, // pdf, video, ... --> has to follow ftp://ftp.fwu.de/fwu/eaf/Signatur-Infos%202015-05.pdf
        creationDate: { type: Date },
        lastModified: { type: Date },
        language: { type: String }, // follow LCID string
        subjects: [{ type: String }], // list of all subjects that apply to content; should follow http://agmud.de/wp-content/uploads/2013/09/sgsyst-20121219.pdf
        targetGroups: [{ state: String, class: String, schoolType: String }], // list of all classes/age groups etc; should follow C10 from ftp://ftp.fwu.de/fwu/eaf/db-eaf.pdf
        target: { type: String }, // prefix 0: pupils / 1: teacher; suffix TODO: excercise, ....
        tags: [{ type: String }],
        restrictions: [{ location: [{ state: String }], minAge: Number }], // e.g. FSK, ...
        relatedResources: [{ type: String }], // list of objects containing URL and type
    },
    getModelObject: function (data) {
        let modelObject = {};
        Object.keys(this.schema).forEach((field) => {
            modelObject[field] = data[field];
            if(this.schema[field].required && (modelObject[field] === undefined || modelObject[field] === null)) {
                throw field + " is required";
            }
        });

        return modelObject;
    }
};

module.exports = contentModel;
