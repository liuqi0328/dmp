'use strict';

// TODO: LINK CORRECT EJS FILES FOR CONTROLLERS
// TODO: UPDATE DIFFERENT FLASH MESSAGES

const formidable = require('formidable');
const titleize = require('titleize');

const ContentTag = require('../../models/contentTag');
const Content = require('../../models/content');
const awsHelpers = require('../helper/awsHelper');

exports.getAll = async (req, res) => {
    let clientId = req.user.client_id;

    let contents = await Content.find({client_id: clientId});
    res.render('cms/content/index', {
        data: contents,
        message: req.flash('contentCreated'),
    });
};

exports.getOne = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentId = req.params.contentId;

    console.log(contentId);

    let content = await Content.findById(contentId);
    if (!content) return res.sendStatus(404);
    if (content.client_id != clientId) return res.sendStatus(401);

    let attachedTags = [];
    try {
        let contentTags = await ContentTag.find({client_id: clientId});
        // attachedTags = contentTags.filter((tag) => {
        //     let attachedContents = tag.contents;
        //     for (let i = 0; i < attachedContents.length; i++) {
        //         return attachedContents[i].id == content._id;
        //     }
        // })
        contentTags.forEach((contentTag) => {
            let attachedContents = contentTag.contents;
            for (let i = 0; i < attachedContents.length; i++) {
                if (attachedContents[i].id == content._id) {
                    if (attachedContents[i].active == true) {
                        contentTag.active_tag = true;
                    }
                    attachedTags.push(contentTag);
                }
            }
        });
    } catch (err) {
        console.log(err);
    }

    console.log(attachedTags);

    // TODO: add .ejs file for content info page
    res.render('cms/content/content', {
        data: content,
        message: '',
        content_tags: attachedTags,
    });
};

exports.newPage = async (req, res) => {
    // let user = req.user;
    // let clientId = user.client_id;

    console.log('content new....');

    res.render('cms/content/new', {
        data: '',
        message: req.flash('createContentErrMsg'),
    });
};

exports.create = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    // let params = req;
    // console.log('create params: ', params);
    // params.client_id = clientId;

    let form = new formidable.IncomingForm();
    form.maxFileSize = 1024 * 1024 * 1024; // MAX FILE SIZE: 1 GB
    form.parse(req, async (err, fields, files) => {
        fields.client_id = clientId;
        console.log('fields: ', fields);
        console.log('files: ', files);

        let filepath = files.file.path;
        let type = files.file.type;

        console.log('after upload: ', filepath, type);

        try {
            let s3 = await awsHelpers.uploadToS3(filepath, clientId, type);
            console.log('s3 upload file...:', s3);

            let params = {
                name: fields.name,
                client_id: clientId,
                content_location: s3.location,
            };

            try {
                let newContent = await Content.create(params);
                console.log('new content: ', newContent);
                req.flash('contentCreated', `Content Created!`);
                res.redirect('/cms/contents');
            } catch (err) {
                req.flash('createContentErrMsg', err.message);
                res.redirect('/cms/contents/new');
            }
        } catch (err) {
            req.flash('createContentErrMsg', err.message);
            res.redirect('/cms/contents/new');
        }
    });
};

exports.updatePage = async (req, res) => {
    let clientId = req.user.client_id;
    let contentId = req.params.contentId;

    try {
        let content = await Content.findById(contentId);
        if (content.client_id !== clientId) return res.sendStatus(401);

        res.render('cms/content/new', {data: content, message: ''});
    } catch (err) {
        console.log('update page get err...!');
        console.log(err);
        req.flash('updateContentErrMsg', err.message);
        res.redirect('/cms/contents/');
    }
};

exports.update = async (req, res) => {
    let clientId = req.user.client_id;
    let contentId = req.params.contentId;

    try {
        let content = await Content.findById(contentId);
        if (content.client_id !== clientId) res.sendStatus(401);
        let update = await content.update(req.body);

        req.flash('updateContentSucess', 'Content successfully updated!');
        res.redirect('/cms/contents');
    } catch (err) {
        console.log('update page get err...!');
        console.log(err);
        req.flash('updateContentErrMsg', err.message);
        res.redirect('/cms/contents/');
    }
};

exports.delete = async (req, res) => {
    let clientId = req.user.client_id;
    let contentId = req.params.contentId;

    let content;
    try {
        content = await Content.findById(contentId);
    } catch (err) {
        console.log('delete content err...!');
        console.log(err);
        return res.redirect('/cms/contents');
    }

    if (!content) res.sendStatus(404);

    try {
        let update = await content.update({active: false}).exec();
        let name = titleize(update.name);

        req.flash('deleteContentSuccess',
                  `${name} was successfully deleted!`);
        res.redirect('/cms/contents');
    } catch (err) {
        console.log('delete content err...!');
        console.log(err);

        req.flash('deleteContentErr', err.message);
        req.redirect('/cms/contents');
    }
};
