import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await User.findOne({ email: session.user.email }).select("-password -otp -otpExpiresAt");
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        let needsSave = false;
        // Auto-heal if partner is approved but onboarding step is outdated
        if (user.partnerStatus === "approved") {
            if (!user.partnerOnBoardingSteps || user.partnerOnBoardingSteps < 4) {
                user.partnerOnBoardingSteps = 4;
                needsSave = true;
            }
            if (user.partnerOnBoardingSteps === 4 && (!user.videoKycStatus || user.videoKycStatus === "not_required")) {
                user.videoKycStatus = "pending";
                needsSave = true;
            }
        }

        // Auto-heal if vehicle is approved but onboarding step is still at 6
        if (user.partnerOnBoardingSteps === 6) {
            const vehicle = await Vehicle.findOne({ owner: user._id });
            if (vehicle && vehicle.status === "approved") {
                user.partnerOnBoardingSteps = 7;
                needsSave = true;
            }
        }

        if (needsSave) {
            await user.save();
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("api/user/me error:", error);
        return NextResponse.json(
            { message: `get me error : ${error}` },
            { status: 500 }
        );
    }
}