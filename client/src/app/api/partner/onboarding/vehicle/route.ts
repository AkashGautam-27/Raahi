// import connectDB from "@/lib/db";
// import { auth } from "@/auth";
// import User from "@/models/user.model";
// import Vehicle from "@/models/vehicle.model";
// import { NextRequest } from "next/server";


// const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
// export async function POST(req: NextRequest) {
//     try {
//         await connectDB();
//         const session = await auth();
//         if (!session || !session.user?.email) {
//             return Response.json(
//                 { message: "Unauthorized" },
//                 { status: 400 }
//             )
//         }
//         let user = await User.findOne({ email: session.user.email })
//         if (!user) {
//             user = await User.create({
//                 name: session.user.name || "Unknown",
//                 email: session.user.email,
//                 role: session.user.role || "user"
//             })
//         }

//         const { type,number,vehicleModel } = await req.json()
//         if(!type || !number || !vehicleModel){
//             return Response.json(
//                 { message: "Missing required fields" },
//                 { status: 400 }
//             )
//         }
//         if (!VEHICLE_REGEX.test(number)) {
//             return Response.json(
//                 { message: "Invalid vehicle number format" },
//                 { status: 400 }
//             )
//         }
//         const vehicleNumberFormatted = number.toUpperCase();
//         const duplicate = await Vehicle.findOne({vehicleNumber:vehicleNumberFormatted})
//         if(duplicate && duplicate.owner.toString() !== user._id.toString()){
//             return Response.json({message:"Vehicle already registered"},{status:400})
//         }

//         let vehicle = await Vehicle.findOne({owner:user._id})
//         let statusCode = 200;

//         if(vehicle){
//             vehicle.type = type
//             vehicle.vehicleNumber = vehicleNumberFormatted
//             vehicle.vehicleModel = vehicleModel
//             vehicle.status = "pending"
//             await vehicle.save()
//         } else {
//             vehicle = await Vehicle.create({
//                 owner:user._id,
//                 type,
//                 vehicleNumber: vehicleNumberFormatted,
//                 vehicleModel,
//                 status: "pending"
//             })
//             statusCode = 201;
//         }

//         if(user.partnerOnBoardingSteps<1){
//             user.partnerOnBoardingSteps=1
//         }
//         user.role="partner"
//         await user.save();
//         return Response.json(vehicle, { status: statusCode })

//     } catch (err) {
//         console.error("Error adding vehicle:", err)
//         return Response.json(
//             { message: "Internal server error" },
//             { status: 500 }
//         )
//     }
// }

// export async function GET(req:NextRequest){
//     try {
//          await connectDB();
//         const session = await auth();
//         if (!session || !session.user?.email) {
//             return Response.json(
//                 { message: "Unauthorized" },
//                 { status: 401 }
//             )
//         }
//         const user = await User.findOne({ email: session.user.email })
//         if (!user) {
//             return Response.json(
//                 { message: "User not found" },  
//                 { status: 404 }
//             )
//         }

//         const vehicle = await Vehicle.findOne({owner:user._id})
//         if(vehicle){
//             return Response.json(vehicle, { status: 200 })
//         }else{
//             return Response.json({ message: "Vehicle not found" }, { status: 404 })
//         }


//     } catch (error) {
//          console.error("Error fetching vehicle:", error)
//         return Response.json(
//             { message: "Error fetching vehicle" },
//             { status: 500 }
//         )
//     }
// }



import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

// Supported vehicle types
const ALLOWED_VEHICLE_TYPES = [
  "bike",
  "auto",
  "car",
  "loading",
  "truck",
];

// Simplified Indian vehicle registration format
const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

// POST: Create or update vehicle
export async function POST(req: NextRequest) {
  try {
    // 1. Connect to database
    await connectDb();

    // 2. Authenticate user
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Find user in database
    let user = await User.findOne({
      $or: [
        ...(session.user.id ? [{ _id: session.user.id }] : []),
        { email: session.user.email },
        { email: session.user.email?.toLowerCase() }
      ]
    });

    if (!user) {
      user = await User.create({
        name: session.user.name || "Partner",
        email: session.user.email,
        role: session.user.role || "user"
      });
    }

    // 4. Parse request body
    const body = await req.json();

    const { type, number, vehicleModel } = body;

    // 5. Validate required fields
    if (
      typeof type !== "string" ||
      typeof number !== "string" ||
      typeof vehicleModel !== "string" ||
      !type.trim() ||
      !number.trim() ||
      !vehicleModel.trim()
    ) {
      return NextResponse.json(
        { message: "All vehicle details are required" },
        { status: 400 }
      );
    }

    // 6. Validate vehicle type
    const normalizedType = type.trim().toLowerCase();

    if (!ALLOWED_VEHICLE_TYPES.includes(normalizedType)) {
      return NextResponse.json(
        { message: "Invalid vehicle type" },
        { status: 400 }
      );
    }

    // 7. Normalize and validate vehicle number
    const vehicleNumber = number.trim().toUpperCase();

    if (!VEHICLE_REGEX.test(vehicleNumber)) {
      return NextResponse.json(
        { message: "Invalid vehicle number format" },
        { status: 400 }
      );
    }

    const normalizedModel = vehicleModel.trim();

    // 8. Check whether another user owns this number
    const duplicate = await Vehicle.findOne({
      number: vehicleNumber,
      owner: { $ne: user._id },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Vehicle already registered" },
        { status: 409 }
      );
    }

    // 9. Find the current user's vehicle
    let vehicle = await Vehicle.findOne({
      owner: user._id,
    });

    let statusCode = 200;

    if (vehicle) {
      // 10A. Update existing vehicle
      vehicle.type = normalizedType;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = normalizedModel;
      vehicle.status = "pending";

      await vehicle.save();
    } else {
      // 10B. Create a new vehicle
      vehicle = await Vehicle.create({
        owner: user._id,
        type: normalizedType,
        vehicleNumber: vehicleNumber,
        vehicleModel: normalizedModel,
        status: "pending",
      });

      statusCode = 201;
    }

    // 11. Update partner onboarding status
    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    user.role = "partner";
    user.partnerStatus = "pending";

    await user.save();

    // 12. Return successful response
    return NextResponse.json(
      {
        message:
          statusCode === 201
            ? "Vehicle registered successfully"
            : "Vehicle updated successfully",
        vehicle,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Vehicle POST error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch current user's vehicle
export async function GET(_req: NextRequest) {
  try {
    // 1. Connect to database
    await connectDb();

    // 2. Authenticate user
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Find user
    const user = await User.findOne({
      $or: [
        ...(session.user.id ? [{ _id: session.user.id }] : []),
        { email: session.user.email },
        { email: session.user.email?.toLowerCase() }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 4. Fetch vehicle belonging to this user
    const vehicle = await Vehicle.findOne({
      owner: user._id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // 5. Return vehicle details
    return NextResponse.json(
      { vehicle },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DOCUMENT UPLOAD ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error";

    return NextResponse.json(
      {
        message: "Internal server error",
        error: message,
      },
      { status: 500 }
    );
  }
}
