import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "./s3";

export async function deleteFromS3(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key
    })
  );
}
