import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const totalPartners = await User.countDocuments({ role: "partner" });
        const totalApprovedPartners = await User.countDocuments({ role: "partner", partnerStatus: "approved" });
        const totalPendingPartners = await User.countDocuments({ role: "partner", partnerStatus: "pending" });
        const totalRejectedPartners = await User.countDocuments({ role: "partner", partnerStatus: "rejected" });

        const pendingPartnersReviews = await User.find({
            role: "partner",
            partnerStatus: "pending",
            partnerOnBoardingSteps: { $gte: 3 }
        });

        const partnerIds = pendingPartnersReviews.map((p) => p._id);
        const pendingVehicles = await Vehicle.find({
            $or: [
                { owner: { $in: partnerIds } },
                { status: "pending" }
            ]
        }).populate("owner");

        return NextResponse.json({
            stats: {
                totalPartners,
                totalApprovedPartners,
                totalPendingPartners,
                totalRejectedPartners
            },
            pendingPartnersReviews,
            pendingVehicles
        }, { status: 200 });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
