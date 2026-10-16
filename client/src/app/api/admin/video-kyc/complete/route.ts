import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const { roomId, action, reason } = await req.json();
        if (!roomId) {
            return NextResponse.json({ message: "roomId is required" }, { status: 400 });
        }

        if (!["approved", "rejected"].includes(action)) {
            return NextResponse.json({ message: "invalid action" }, { status: 400 });
        }

        const partner = await User.findOne({
            videoKycRoomId: roomId,
            role: "partner"
        });

        if (!partner) {
            return NextResponse.json({ message: "partner not found" }, { status: 404 });
        }

        if (action === "approved") {
            partner.videoKycStatus = "approved";
            partner.videoKycRejectionReason = "";
            partner.partnerOnBoardingSteps = 5;
        } else if (action === "rejected") {
            if (!reason) {
                return NextResponse.json({ message: "rejection reason is required." }, { status: 400 });
            }
            partner.videoKycStatus = "rejected";
            partner.videoKycRejectionReason = reason.trim();
        }

        await partner.save();
        return NextResponse.json({ status: partner.videoKycStatus }, { status: 200 });
    } catch (error) {
        console.error("kyc complete error:", error);
        return NextResponse.json({ message: `kyc complete error ${error}` }, { status: 500 });
    }
}
