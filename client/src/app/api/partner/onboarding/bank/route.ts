import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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

        const { accountHolder, accountNumber, upi, ifsc, mobileNumber } = await req.json()
        if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
            return Response.json(
                { message: "send all bank details" },
                { status: 400 }
            )
        }

        const partnerBank = await PartnerBank.findOneAndUpdate(
            { owner: user._id },
            {
                $set: {
                    owner: user._id,
                    accountHolderName: accountHolder,
                    accountHolder: accountHolder,
                    accountNumber: accountNumber,
                    ifscCode: ifsc,
                    ifsc: ifsc,
                    upiId: upi,
                    upi: upi,
                    status: "added"
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        user.mobileNumber = mobileNumber
        user.partnerOnBoardingSteps = 3
        user.partnerStatus = "pending"
        await user.save();
        return Response.json(partnerBank, { status: 201 })




    } catch (error) {
        console.error("Error uploading documents:", error)
        return Response.json(
            { message: "Error get bank details" },
            { status: 500 }
        )
    }
}



export async function GET(req: NextRequest) {
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



        let partnerBank = await PartnerBank.findOne(
            { owner: user._id }
        )
        if (!partnerBank) {
            partnerBank = await PartnerBank.findOne({
                $or: [{ owner: null }, { owner: { $exists: false } }]
            });
            if (partnerBank) {
                partnerBank.owner = user._id;
                await partnerBank.save();
            }
        }

        if (partnerBank) {
            return Response.json({
                partnerBank: {
                    accountHolder: partnerBank.accountHolderName,
                    accountHolderName: partnerBank.accountHolderName,
                    accountNumber: partnerBank.accountNumber,
                    ifsc: partnerBank.ifscCode,
                    ifscCode: partnerBank.ifscCode,
                    upi: partnerBank.upiId,
                    upiId: partnerBank.upiId,
                    status: partnerBank.status
                },
                mobileNumber: user.mobileNumber || "",
                ...partnerBank.toObject()
            }, { status: 200 })
        } else {
            return Response.json({ message: "Bank details not found" }, { status: 404 })
        }




    } catch (error) {
        console.error("get Error uploading documents:", error)
        return Response.json(
            { message: "get Error bank details" },
            { status: 500 }
        )
    }
}