import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import Vehicle from "@/models/vehicle.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const { id: partnerId } = await context.params;
        const partner = await User.findById(partnerId);

        if (!partner || partner.role !== "partner") {
            return NextResponse.json({ message: "partner not found" }, { status: 404 });
        }

        partner.partnerStatus = "approved";
        partner.partnerOnBoardingSteps = 4;
        partner.rejectionReason = "";
        await partner.save();

        await Vehicle.updateMany({ owner: partnerId }, { status: "approved" });
        await PartnerDocs.updateMany({ owner: partnerId }, { status: "approved" });
        await PartnerBank.updateMany({ owner: partnerId }, { status: "verified" });

        return NextResponse.json({
            message: "Partner approved successfully",
            partner
        }, { status: 200 });

    } catch (error) {
        console.error("partner approved error:", error);
        return NextResponse.json(
            { message: `partner approved error: ${error}` },
            { status: 500 }
        );
    }
}
