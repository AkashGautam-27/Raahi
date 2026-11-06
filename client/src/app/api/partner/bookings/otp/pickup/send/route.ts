import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { bookingId } = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if (!booking) {
            return NextResponse.json(
                { message: "booking not found" },
                { status: 400 }
            )
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        booking.pickUpOtp = otp
        booking.pickUpOtpExpires = new Date(Date.now() + 5 * 60 * 1000)
        await booking.save()

        if (booking.user.email) {
            await sendMail(booking.user.email, "Your Pickup OTP - RAAHI",
                `
           <!DOCTYPE html> <html> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> </head> <body style=" margin: 0; padding: 0; background-color: #f4f7fb; font-family: Arial, sans-serif; "> <div style=" max-width: 500px; margin: 40px auto; background-color: #ffffff; padding: 35px; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.08); "> <h1 style=" margin-bottom: 10px; color: #111827; font-size: 30px; "> RAAHI </h1> <p style=" color: #6b7280; font-size: 14px; margin-bottom: 30px; "> Move Smarter. Go Further. </p> <h2 style=" color: Your Pickup OTP is: :  </h2> <p style=" color: #6b7280; font-size: 15px; line-height: 1.P is: </p> <div style=" display: inline-block; margin: 20px 0; padding: 15px 30px; background-color: #f3f4f6; border: 2px dashed #111827; border-radius: 10px; "> <span style=" font-size: 32px; font-weight: bold; color:white; background-color:blue; letter-spacing: 8px; color: #111827; "> ${otp}</span> </div> <p style=" color: #9ca3af; font-size: 13px; margin-top: 20px; "> This OTP is valid for 5 minutes. </p> <p style=" color: #9ca3af; font-size: 12px; margin-top: 25px; "> share this otp with your driver to start the ride. </p> </div> </body> </html> 
        `)
        }

        return NextResponse.json(
            { message: "pick up otp sent" },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: "pick up otp error" },
            { status: 500 }
        )
    }
}