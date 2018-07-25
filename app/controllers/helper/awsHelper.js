'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

/**
 * Set up AWS credential, and assign AlexaDeveloper role from the AWS account.
 *
 * @return {[type]}
 */
const awsSetup = () => {
    return new Promise((resolve, reject) => {
        AWS.config.update({
            region: 'us-east-1',
        });
        const credentials = new AWS.SharedIniFileCredentials({
            profile: 'default',
        });
        AWS.config.credentials = credentials;
        let sts = new AWS.STS({
            apiVersion: '2011-06-15',
        });
        // SET IAM ROLE
        let roleparams = {
            RoleArn: 'arn:aws:iam::429365556200:role/AlexaDeveloper',
            RoleSessionName: 'AlexaDeveloperRole1',
        };
        sts.assumeRole(roleparams, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            } else {
                let creds = new AWS.Credentials(
                    data.Credentials.AccessKeyId,
                    data.Credentials.SecretAccessKey,
                    data.Credentials.SessionToken
                );
                AWS.config.credentials = creds;
                resolve();
            }
        });
    });
};

// GET S3 BUCKETS
const awsS3listbuckets = () => {
    return new Promise((resolve, reject) => {
        let s3 = new AWS.S3();
        s3.listBuckets((err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
                reject(err);
            } else {
                // console.log(data); // successful response
                resolve(data);
            }
        });
    });
};

const uploadToS3 = async (filepath, clientId, type) => {
    await awsSetup();
    let buckets = await awsS3listbuckets();

    let bucketName = 'dmp-cms-contents';
    let bucket = buckets.Buckets.find((bucket) => {
        return bucket.name == bucketName;
    });

    console.log('first bucket call: ', bucket);

    let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    if (!bucket) {
        let params = { Bucket: bucketName };
        return new Promise((resolve, reject) => {
            s3.createBucket(params, async function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    console.log('bucket created!');
                    console.log('upload icon after bucket');

                    let file = await putObject(filepath, bucketName, clientId, type);

                    resolve(file);
                }
            });
        });
    } else {
        console.log('upload icon');

        let file = await putObject(filepath, bucketName, clientId, type);

        return file;
    }
};

// exports.awsSetup = awsSetup;
exports.awsS3listbuckets = awsS3listbuckets;
exports.uploadToS3 = uploadToS3;

let putObject = (filepath, bucketName, clientId, type) => {
    let s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    let file = fs.createReadStream(filepath);

    type = 'png';

    let fileName = new Date(Date.now());
    let fileKey = (fileName.getTime() / 1000).toFixed(0);

    return new Promise((resolve, reject) => {
        s3.putObject({
            Bucket: bucketName,
            Key: `${clientId}/${fileKey}.${type}`,
            ACL: 'public-read',
            Body: file,
        }, (err, data) => {
            if (err) {
                console.error('upload icon err: ', err);
                reject(err);
            }
            data.location = `${clientId}/${fileKey}.${type}`;
            console.log('upload icon success: ', data);
            resolve(data);
        });
    });
};
