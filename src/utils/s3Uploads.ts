import {PutObjectCommand} from "@aws-sdk/client-s3";
import {s3Client, S3_BUCKET_NAME} from "./s3";
import {v4 as uuid } from "uuid";

export async function uploadToS3(
    file: Express.Multer.File,
    folder: "players" | "contracts" | "clubs"

){
    const key = `${folder}/${uuid()}-${file.originalname}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "private"
        })
    );

    const url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { key, url };
}