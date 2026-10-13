import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import PartnerDocs from "@/models/partnerDocs.model";
import PartnerBank from "@/models/partnerBank.model";
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

        const partner = await User.findById(id).select("-password -otp -otpExpiresAt");
        if (!partner) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 });
        }

        const vehicle = await Vehicle.findOne({ owner: id });
        const documents = await PartnerDocs.findOne({ owner: id });
        const bank = await PartnerBank.findOne({ owner: id });

        return NextResponse.json({
            partner,
            vehicle,
            documents,
            bank
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching partner details:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function PATCH(
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
        const body = await req.json();
        const { status, rejectionReason } = body;

        if (!status || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
        }

        const updatedPartner = await User.findByIdAndUpdate(
            id,
            {
                partnerStatus: status,
                ...(status === "approved" ? { role: "partner" } : {})
            },
            { new: true }
        ).select("-password -otp -otpExpiresAt");

        if (!updatedPartner) {
            return NextResponse.json({ message: "Partner not found" }, { status: 404 });
        }

        await Vehicle.updateMany(
            { owner: id },
            {
                status,
                ...(status === "rejected" ? { rejectionReason } : {})
            }
        );

        await PartnerDocs.updateMany(
            { owner: id },
            {
                status,
                ...(status === "rejected" ? { rejectionReason } : {})
            }
        );

        return NextResponse.json({
            message: `Partner ${status} successfully`,
            partner: updatedPartner
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating partner review:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
