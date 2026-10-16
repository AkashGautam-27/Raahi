import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import PartnerDocs from "@/models/partnerDocs.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await User.findOne({ email: session.user.email });
        if (!adminUser || adminUser.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "Partner ID is required" }, { status: 400 });
        }

        const updatedPartner = await User.findByIdAndUpdate(
            id,
            {
                partnerStatus: "approved",
                role: "partner"
            },
            { new: true }
        ).select("-password -otp -otpExpiresAt");

        if (!updatedPartner) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 });
        }

        await Vehicle.updateMany({ owner: id }, { status: "approved" });
        await PartnerDocs.updateMany({ owner: id }, { status: "approved" });

        return NextResponse.json({
            message: "Partner approved successfully",
            partner: updatedPartner
        }, { status: 200 });

    } catch (error) {
        console.error("Error approving partner:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
