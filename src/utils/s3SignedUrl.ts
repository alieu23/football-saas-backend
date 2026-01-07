import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "./s3";

export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 60 * 5 // 5 minutes
) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
