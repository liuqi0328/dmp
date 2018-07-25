'use strict';

// const mongoose = require('mongoose');
const ContentTag = require('../../models/contentTag');
const Content = require('../../models/content');

exports.getAll = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    let contentTags = await ContentTag.find({
        client_id: clientId,
        active: true,
    });

    let data = [];

    for (let i = 0; i < contentTags.length; i++) {
        let contentTag = contentTags[i];
        let activeContent = await Content.findOne({
            content_tag: contentTag._id,
            active: true,
        });
        let entry = {
            content_tag: contentTag,
            active_content: activeContent,
        };
        data.push(entry);
    }

    console.log('data: ', data);

    // TODO: add .ejs file for content index page
    res.render('cms/content-tag/index',
               {data: data, message: req.flash('deleteMessage')});
};

exports.getOne = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentTagId = req.params.contentTagId;

    console.log(contentTagId);

    let contentTag = await ContentTag.findById(contentTagId);
    if (!contentTag) return res.sendStatus(404);
    if (contentTag.client_id != clientId) return res.sendStatus(401);

    let contents = await Content.find({content_tag: contentTag._id});

    // TODO: add .ejs file for content info page
    res.render('cms/content-tag/content-tag',
               {content_tag: contentTag, data: contents});
};

exports.new = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    res.render('cms/content-tag/new');
};

exports.create = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    let params = req.body;
    params.client_id = clientId;

    let existing;
    try {
        existing = await ContentTag.findOne({name: params.name});
    } catch (err) {
        console.log(err);
    }
    if (existing) {
        try {
            let update = await existing.update({
                active: true,
                last_updated: Date.now(),
            }).exec();
            res.redirect(`/cms`);
        } catch (err) {
            console.log('create new content tag err...!');
            console.log(err);
            res.redirect('/cms/new');
        }
    } else {
        try {
            let contentTag = await ContentTag.create(params);
            res.redirect(`/cms`);
        } catch (err) {
            console.log('create new content tag err...!');
            console.log(err);
            res.redirect('/cms/new');
        }
    }
};

exports.updatePage = async (req, res) => {
    let contentTagId = req.params.contentTagId;
    let contentTag = await ContentTag.findById(contentTagId);

    res.render('cms/content-tag/update', {data: contentTag});
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
    // let ID = mongoose.Types.ObjectId(contentTagId);

    // console.log('IDS: ', contentTagId, ID);

    let contentTag = await ContentTag.findById(contentTagId);
    if (contentTag.client_id !== clientId) res.sendStatus(401);

    try {
        let deletedContentTag = await contentTag.update({
            active: false,
            last_updated: Date.now(),
        }).exec();
        console.log('deleted content tag: ', deletedContentTag);
    } catch (err) {
        console.log('delete content tag err...!');
        console.log(err);
    }

    // TODO: add flash message for errors
    req.flash('deleteMessage', 'Content Tag Deleted!');
    res.redirect('/cms');
};
