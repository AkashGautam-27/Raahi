import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const partner = await User.findOne({ email: session.user?.email });
        if (!partner) {
            return NextResponse.json({ message: "partner not found" }, { status: 404 });
        }

        if (partner.videoKycStatus !== "rejected") {
            return NextResponse.json(
                { message: "You can not send KYC request at this time." },
                { status: 400 }
            );
        }

        partner.videoKycStatus = "pending";
        partner.videoKycRejectionReason = "";
        partner.videoKycRoomId = "";
        await partner.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("kyc request error:", error);
        return NextResponse.json({ message: `kyc request error ${error}` }, { status: 500 });
    }
}
