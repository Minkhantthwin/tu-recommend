import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "tu-recommend";

// Public URL for external access (set this in production)
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

// Public read policy for the bucket
const publicPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
    },
  ],
};

// Initialize bucket if it doesn't exist
export async function initializeMinioBucket(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET);
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET, "us-east-1");
      console.log(`📦 MinIO bucket '${MINIO_BUCKET}' created`);
    } else {
      console.log(`📦 MinIO bucket '${MINIO_BUCKET}' already exists`);
    }

    // Always set public read policy
    await minioClient.setBucketPolicy(
      MINIO_BUCKET,
      JSON.stringify(publicPolicy),
    );
    console.log(`🔓 MinIO bucket '${MINIO_BUCKET}' set to public read`);
  } catch (error) {
    console.error("❌ MinIO initialization error:", error);
    throw error;
  }
}
