'use strict';

const formidable = require('formidable');
const ContentTag = require('../../models/contentTag');
const Content = require('../../models/content');
const awsHelpers = require('../helper/awsHelper');

exports.getAll = async (req, res) => {
    let clientId = req.user.client_id;

    let contents = await Content.find({client_id: clientId});
    res.render('cms/content/index', {data: contents, message: ''});
};

exports.getOne = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentId = req.params.contentId;

    console.log(contentId);

    let content = await Content.findById(contentId);
    if (!content) return res.sendStatus(404);
    if (content.client_id != clientId) return res.sendStatus(401);

    // TODO: add .ejs file for content info page
    res.render('cms/content/content', { data: content });
};

exports.new = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    res.render('cms/content/new', {message: ''});
};

exports.create = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    // let params = req.body;
    // params.client_id = clientId;

    let form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        fields.client_id = clientId;
        console.log('fields: ', fields);
        console.log('files: ', files);

        let filepath = files.file.path;
        let type = files.file.type;
        let s3 = await awsHelpers.uploadToS3(filepath, clientId, type);
        console.log('s3 upload file...:', s3);

        let params = {
            name: fields.name,
            client_id: clientId,
            content_location: s3.location,
        };
        let newContent = await Content.create(params);
        console.log('new content: ', newContent);
        res.redirect('/cms/contents');
    });
};

exports.updatePage = async (req, res) => {
    let clientId = req.user.client_id;
    let contentId = req.params.contentId;

    let content = await Content.findById(contentId);
    if (content.client_id !== clientId) res.sendStatus(401);

    res.render('cms/content/update', {data: content});
};
