import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(
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
        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            {
                status: "approved",
                rejectionReason: ""
            },
            { new: true }
        );

        if (!vehicle) {
            return Response.json({ message: "vehicle not found" }, { status: 404 });
        }

        await User.findByIdAndUpdate(vehicle.owner, {
            partnerOnBoardingSteps: 7
        });

        return Response.json(
            { message: "Vehicle approved successfully", vehicle },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { message: `vehicle approve error ${error}` },
            { status: 500 }
        );
    }
}
