import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Build an S3 client from environment variables.
 * Supports S3-compatible services (MinIO, Hetzner) via S3_ENDPOINT.
 */
function getS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.AWS_REGION || process.env.S3_REGION || "us-east-1",
    ...(endpoint
      ? {
          endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
          forcePathStyle: true,
        }
      : {}),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
}

const s3 = getS3Client();

/** Derive a MIME content type from a filename extension. */
function guessContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
    pdf: "application/pdf",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "text/typescript",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * POST handler for JSON-based S3 operations:
 * - list: List objects in a bucket/prefix
 * - delete: Delete an object by key
 * - get-signed-url: Generate a presigned download URL
 * - create-folder: Create an empty "folder" object
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bucket, prefix, key, continuationToken } = body;

    if (!bucket) {
      return NextResponse.json({ error: "bucket is required" }, { status: 400 });
    }

    switch (action) {
      case "list": {
        const command = new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix || "",
          Delimiter: "/",
          MaxKeys: 1000,
          ContinuationToken: continuationToken || undefined,
        });

        const result = await s3.send(command);

        const folders = (result.CommonPrefixes || []).map((cp) => ({
          key: cp.Prefix || "",
          name: (cp.Prefix || "").replace(prefix || "", "").replace(/\/$/, ""),
          size: 0,
          lastModified: "",
          storageClass: "",
          isFolder: true,
        }));

        const files = (result.Contents || [])
          .filter((obj: _Object) => obj.Key !== prefix)
          .map((obj: _Object) => ({
            key: obj.Key || "",
            name: (obj.Key || "").replace(prefix || "", ""),
            size: obj.Size || 0,
            lastModified: obj.LastModified?.toISOString() || "",
            storageClass: obj.StorageClass || "STANDARD",
            isFolder: false,
          }));

        return NextResponse.json({
          objects: [...folders, ...files],
          prefix: prefix || "",
          bucket,
          continuationToken: result.NextContinuationToken,
          isTruncated: result.IsTruncated || false,
        });
      }

      case "delete": {
        if (!key) {
          return NextResponse.json({ error: "key is required" }, { status: 400 });
        }
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        return NextResponse.json({ key, deleted: true });
      }

      case "get-signed-url": {
        if (!key) {
          return NextResponse.json({ error: "key is required" }, { status: 400 });
        }
        const expiresIn = 3600;
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: bucket, Key: key }),
          { expiresIn },
        );
        return NextResponse.json({ url, expiresIn });
      }

      case "create-folder": {
        if (!key) {
          return NextResponse.json({ error: "key is required" }, { status: 400 });
        }
        const folderKey = key.endsWith("/") ? key : key + "/";
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: folderKey,
            Body: "",
            ContentType: "application/x-directory",
          }),
        );
        return NextResponse.json({ key: folderKey, created: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[S3 API] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT handler for file uploads via FormData.
 * Expects: file (File), action="put", bucket, key
 */
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const key = formData.get("key") as string | null;

    if (!file || !bucket || !key) {
      return NextResponse.json(
        { error: "file, bucket, and key are required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || guessContentType(file.name);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return NextResponse.json({
      key,
      bucket,
      size: buffer.length,
    });
  } catch (err) {
    console.error("[S3 API] Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
