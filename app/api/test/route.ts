import { NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "MongoDB connected successfully!" });
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

