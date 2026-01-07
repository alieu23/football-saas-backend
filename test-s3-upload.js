import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadTestFile() {
  try {
    const fileStream = fs.createReadStream("test.txt");

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "dev-tests/test.txt",
      Body: fileStream,
      ContentType: "text/plain",
    });

    await s3.send(command);

    console.log("✅ Upload successful!");
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
  }
}

uploadTestFile();
