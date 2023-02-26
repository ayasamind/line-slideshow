import { S3Client, ListObjectCommand } from "@aws-sdk/client-s3";

export const handler = async(event) => {
    const bucketName = process.env.BUCKET_NAME;
    const client = new S3Client({ region: "ap-northeast-1" });
    const command = new ListObjectCommand({
        Bucket: bucketName,
    });
    const result = await client.send(command);
    console.log(result)
};