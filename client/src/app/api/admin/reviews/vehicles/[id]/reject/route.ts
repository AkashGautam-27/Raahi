import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }

        await connectDb();
        const vehicleId = (await context.params).id;
        const body = await req.json().catch(() => ({}));
        const rejectionReason = body.reason || body.rejectionReason || "";

        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            {
                status: "rejected",
                rejectionReason
            },
            { new: true }
        );

        if (!vehicle) {
            return Response.json({ message: "vehicle not found" }, { status: 404 });
        }

        return Response.json(
            { message: "Vehicle rejected successfully", vehicle },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { message: `vehicle reject error ${error}` },
            { status: 500 }
        );
    }
}
