import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const partners = await User.find({
            role: "partner",
            partnerOnBoardingSteps: 4,
            videoKycStatus: { $in: ["pending", "in_progress"] }
        }).select("-password -otp -otpExpiresAt");

        return NextResponse.json(partners, { status: 200 });
    } catch (error) {
        console.error("video-kyc pending error:", error);
        return NextResponse.json(
            { message: `partner kyc get error ${error}` },
            { status: 500 }
        );
    }
}
