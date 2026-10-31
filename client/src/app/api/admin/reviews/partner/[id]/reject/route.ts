import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import PartnerDocs from "@/models/partnerDocs.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb();
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

        const { rejectionReason } = await req.json();

        const updatedPartner = await User.findByIdAndUpdate(
            id,
            {
                partnerStatus: "rejected",
                rejectionReason: rejectionReason || ""
            },
            { new: true }
        ).select("-password -otp -otpExpiresAt");

        if (!updatedPartner) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 });
        }

        await Vehicle.updateMany(
            { owner: id },
            {
                status: "rejected",
                rejectionReason
            }
        );

        await PartnerDocs.updateMany(
            { owner: id },
            {
                status: "rejected",
                rejectionReason
            }
        );

        return NextResponse.json({
            message: "Partner rejected successfully",
            partner: updatedPartner
        }, { status: 200 });

    } catch (error) {
        console.error("Error rejecting partner:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
