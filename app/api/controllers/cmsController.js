'use strict';

const Content = require('../../../app/models/content');
const ContentTag = require('../../../app/models/contentTag');

exports.getContent = async (req, res) => {
    console.log('cms api: ', req.query, res.locals.client);
    let contentTagName = req.query.content_tag;
    let clientId = res.locals.client.client_id;
    let contentTag;
    try {
        contentTag = await ContentTag.findOne({
            name: contentTagName,
            client_id: clientId,
        });
    } catch (err) {
        console.log(err);
    }
    let selectedContentIds = contentTag ? contentTag.contents : [];
    let activeContent;
    for (let i = 0; i < selectedContentIds.length; i++) {
        let content = selectedContentIds[i];
        if (content.active == true) {
            try {
                activeContent = await Content.findById(content.id);
            } catch (err) {
                console.log(err);
            }
            break;
        }
    }
    if (!activeContent) return res.sendStatus(404);
    res.send(activeContent);
};
