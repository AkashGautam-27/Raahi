import connectDB from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";


const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json(
                { message: "User not found" },  
                { status: 404 }
            )
        }

        const { type,number,vehicleModel } = await req.json()
        if(!type || !number || !vehicleModel){
            return Response.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }
        if (!VEHICLE_REGEX.test(number)) {
            return Response.json(
                { message: "Invalid vehicle number format" },
                { status: 400 }
            )
        }
        const vehicleNumberFormatted = number.toUpperCase();
        const duplicate = await Vehicle.findOne({vehicleNumber:vehicleNumberFormatted})
        if(duplicate && duplicate.owner.toString() !== user._id.toString()){
            return Response.json({message:"Vehicle already registered"},{status:400})
        }
        
        let vehicle = await Vehicle.findOne({owner:user._id})
        let statusCode = 200;
        
        if(vehicle){
            vehicle.type = type
            vehicle.vehicleNumber = vehicleNumberFormatted
            vehicle.vehicleModel = vehicleModel
            vehicle.status = "pending"
            await vehicle.save()
        } else {
            vehicle = await Vehicle.create({
                owner:user._id,
                type,
                vehicleNumber: vehicleNumberFormatted,
                vehicleModel,
                status: "pending"
            })
            statusCode = 201;
        }
        
        if(user.partnerOnBoardingSteps<1){
            user.partnerOnBoardingSteps=1
        }
        user.role="partner"
        await user.save();
        return Response.json(vehicle, { status: statusCode })

    } catch (err) {
        console.error("Error adding vehicle:", err)
        return Response.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(req:NextRequest){
    try {
         await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json(
                { message: "User not found" },  
                { status: 404 }
            )
        }

        const vehicle = await Vehicle.findOne({owner:user._id})
        if(vehicle){
            return Response.json(vehicle, { status: 200 })
        }else{
            return Response.json({ message: "Vehicle not found" }, { status: 404 })
        }


    } catch (error) {
         console.error("Error fetching vehicle:", error)
        return Response.json(
            { message: "Error fetching vehicle" },
            { status: 500 }
        )
    }
}