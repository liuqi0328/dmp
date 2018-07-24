'use strict';

const ContentTag = require('../../models/contentTag');
const Content = require('../../models/content');

exports.getAll = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    let contentTags = await ContentTag.find({
        client_id: clientId,
        active: true,
    });
    console.log(contentTags);

    let data = [];

    for (let i = 0; i < contentTags.length; i++) {
        let contentTag = contentTags[i];
        let activeContent = await Content.findOne({
            content_tag: contentTag._id,
            active: true,
        });
        let entry = {
            name: contentTag.name,
            active_content: activeContent,
        };
        data.push(entry);
    }

    // TODO: add .ejs file for content index page
    res.render('cms/content-tag/index', {data: data});
};

exports.getOne = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (!contentTag) return res.sendStatus(404);
    if (contentTag.client_id != clientId) return res.sendStatus(401);

    let contents = await Content.find({content_tag: contentTag._id});

    // TODO: add .ejs file for content info page
    res.render('cms/content-tag/content-tag', {data: contents});
};

exports.create = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    let params = req.body;
    params.client_id = clientId;

    try {
        let contentTag = await ContentTag.create(params);
        res.redirect(`/cms/content_tags/${contentTag._id}`);
    } catch (err) {
        console.log('create new content tag err...!');
        console.log(err);
        res.redirect('/cms/content_tags/new');
    }
};

exports.update = async (req, res) => {
    let clientId = req.user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (contentTag.client_id !== clientId) res.sendStatus(401);

    let params = req.body;
    try {
        let updatedContentTag = await contentTag.update(params).exec();
        console.log('updated content tag: ', updatedContentTag);
    } catch (err) {
        console.log('update content tag err...!');
        console.log(err);
    }

    // TODO: add .ejs file for content tag update page
    // TODO: add flash message for errors
    res.redirect(`/cms/content_tags/${contentTagId}`);
};

exports.delete = async (req, res) => {
    let clientId = req.user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (contentTag.client_id !== clientId) res.sendStatus(401);

    try {
        let deletedContentTag = await contentTag.update({active: false}).exec();
        console.log('deleted content tag: ', deletedContentTag);
    } catch (err) {
        console.log('delete content tag err...!');
        console.log(err);
    }

    res.redirect('/cms/content_tags');
};
