'use strict';

// TODO: ADD CATCH ERR PHRASE FOR AWAIT/ASYNC FUNCTIONS

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

        let contents = contentTag.contents;
        let active = contents.find((content) => {
            return content.active == true;
        });
        let activeContent;
        try {
            activeContent = await Content.findById(active.id);
        } catch (err) {
            console.log(err);
        }

        let entry = {
            content_tag: contentTag,
            active_content: activeContent,
        };
        console.log('...... ', contentTag.contents);
        data.push(entry);
    }

    // TODO: add .ejs file for content index page
    res.render('cms/content-tag/index', {
        data: data,
        message: req.flash('deleteMessage'),
    });
};

exports.getOne = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (!contentTag) return res.sendStatus(404);
    if (contentTag.client_id != clientId) return res.sendStatus(401);

    let selectedContents = contentTag.contents;
    let activeContent = selectedContents.find((content) => {
        return content.active == true;
    });

    let contents = [];
    for (let i = 0; i < selectedContents.length; i++) {
        let contentId = selectedContents[i].id;
        try {
            let content = await Content.findById(contentId);
            contents.push(content);
        } catch (err) {
            console.log(err);
            continue;
        }
    }

    // TODO: add .ejs file for content info page
    res.render('cms/content-tag/content-tag', {
        content_tag: contentTag,
        active_content_id: activeContent.id,
        data: contents,
        message: '',
    });
};

exports.new = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;

    let contents;
    try {
        contents = await Content.find({client_id: clientId});
    } catch (err) {
        console.log(err);
    }

    res.render('cms/content-tag/new', {
        contents: contents,
        data: '',
        selected_contents: [],
        active_content_id: '',
    });
};

exports.create = async (req, res) => {
    let user = req.user;
    let clientId = user.client_id;
    let contentIds = req.body.content_ids || [];
    let activeContentId = req.body.active_content;

    let params = {};
    params.name = req.body.name;
    params.client_id = clientId;

    let contents = [];
    for (let i = 0; i < contentIds.length; i++) {
        let contentId = contentIds[i];
        let entry = {};
        entry.id = contentId;
        if (contentId == activeContentId) {
            entry.active = true;
        } else {
            entry.active = false;
        }
        contents.push(entry);
    }
    params.contents = contents;

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
                contents: contents,
                last_updated: Date.now(),
            }).exec();
            res.redirect(`/cms/content_tags`);
        } catch (err) {
            console.log('create new content tag err...!');
            console.log(err);
            res.redirect('/cms/content-tags/new');
        }
    } else {
        try {
            let contentTag = await ContentTag.create(params);
            res.redirect(`/cms/content_tags`);
        } catch (err) {
            console.log('create new content tag err...!');
            console.log(err);
            res.redirect('/cms/content-tags/new');
        }
    }
};

exports.updatePage = async (req, res) => {
    let clientId = req.user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (contentTag.client_id != clientId) return res.sendStatus(401);

    let existingContents = contentTag.contents;
    let activeContent = existingContents.find((content) => {
        return content.active == true;
    });

    let contents;
    try {
        contents = await Content.find({client_id: clientId});
    } catch (err) {
        console.log(err);
    }

    res.render('cms/content-tag/new', {
        data: contentTag,
        contents: contents || [],
        selected_contents: existingContents,
        active_content_id: activeContent.id,
    });
};

exports.update = async (req, res) => {
    let clientId = req.user.client_id;
    let contentTagId = req.params.contentTagId;

    let contentTag = await ContentTag.findById(contentTagId);
    if (contentTag.client_id !== clientId) res.sendStatus(401);

    let params = {};
    params.name = req.body.name;
    params.client_id = clientId;

    let contentIds = req.body.content_ids || [];
    if (typeof contentIds == 'string') contentIds = [contentIds];

    console.log('selected!!!!!! ', contentIds);

    let activeContentId = req.body.active_content;

    let contents = [];
    for (let i = 0; i < contentIds.length; i++) {
        let contentId = contentIds[i];
        let entry = {};
        entry.id = contentId;
        if (contentId == activeContentId) {
            entry.active = true;
        } else {
            entry.active = false;
        }
        contents.push(entry);
    }
    params.contents = contents;

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
    res.redirect('/cms/content_tags');
};
