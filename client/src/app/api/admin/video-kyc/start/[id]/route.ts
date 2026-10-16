import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id: partnerId } = await context.params;
        const partner = await User.findById(partnerId);

        if (!partner || partner.role !== "partner") {
            return NextResponse.json({ message: "partner not found" }, { status: 404 });
        }

        const roomId = partner.videoKycRoomId || `kyc-${partner._id}-${Date.now()}`;
        partner.videoKycRoomId = roomId;
        partner.videoKycStatus = "in_progress";
        partner.partnerOnBoardingSteps = 4;

        await partner.save();

        return NextResponse.json({ roomId }, { status: 200 });
    } catch (error) {
        console.error("video kyc start error:", error);
        return NextResponse.json({ message: "video kyc start error" }, { status: 500 });
    }
}
