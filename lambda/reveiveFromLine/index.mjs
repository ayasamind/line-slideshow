import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from 'node-fetch';

export const handler = async(event) => {
    const body = JSON.parse(event.body)

    await Promise.all(body['events'].map(async (e) => {
        const apiKey = process.env.API_KEY;
        const bucketName = process.env.BUCKET_NAME;
        const type = e['message']['type'];
        const messageId = e['message']['id'];
        const userId = e['source']['userId'];
        const url = "https://api-data.line.me/v2/bot/message/"+messageId+"/content";
        const profileUrl = 'https://api.line.me/v2/bot/profile/'+userId;
        let contentType = "image/jpeg";
        console.log(messageId)
        console.log(userId)
        console.log(apiKey)
        console.log(type)

        if (type === "image") {
            await fetch(url, {
                method: 'GET',
                headers: { "Authorization": "Bearer " + apiKey } 
            })
            .then((response) => {
                console.log(response)
                contentType = response.headers.get('content-type');
                if (response.ok) {
                    return response;
                }
                return Promise.reject(new Error(
                        `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
                })
            .then(response => response.arrayBuffer())
            .then(async (buffer) => {
                const client = new S3Client({ region: "ap-northeast-1" });
                const command = new PutObjectCommand({
                    Body: buffer,
                    Bucket: bucketName,
                    Key: messageId + '/' + messageId + '_photo',
                    ContentType: contentType,
                });
                const result = await client.send(command);
                await fetch(profileUrl, {
                    method: 'GET',
                    headers: { "Authorization": "Bearer " + apiKey } 
                })
                .then((res) => { 
                    return res.json() 
                })
                .then(async (res) => {
                    const pictureUrl = res['pictureUrl'];
                    const displayName = res['displayName'];
                    await fetch(pictureUrl, {
                        method: 'GET',
                        headers: { "Authorization": "Bearer " + apiKey } 
                    })
                    .then((response) => {
                        contentType = response.headers.get('content-type');
                        if (response.ok) {
                            return response;
                        }
                        return Promise.reject(new Error(
                                `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
                        })
                    .then(response => response.arrayBuffer())
                    .then(async (buffer) => {
                        const client = new S3Client({ region: "ap-northeast-1" });
                        const command = new PutObjectCommand({
                            Body: buffer,
                            Bucket: bucketName,
                            Key: messageId + '/' + displayName + '_profile',
                            ContentType: contentType,
                        });
                        const result = await client.send(command);
                    })
                })
            })
        }
    }))
};
