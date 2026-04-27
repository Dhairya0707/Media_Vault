import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression(`folder:${process.env.CLOUDINARY_FOLDER || "media-vault"}/*`)
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute();

    return NextResponse.json(result.resources);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch media " + error },
      { status: 500 }
    );
  }
}
