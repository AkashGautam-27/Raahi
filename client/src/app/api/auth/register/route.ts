import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();
        await connectDB();
        let user = await User.findOne({ email })
        if (user && user.isEmailVerified) {
            return NextResponse.json(
                { message: "email already exist" },
                { status: 400 }
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)



        if (password.length < 6) {
            return NextResponse.json(
                { message: "password must be at least 6 characters" },
                { status: 400 }
            )
        }


        const hashPassword = await bcrypt.hash(password, 10)
        if (user && !user.isEmailVerified) {
            user.name = name
            user.password = hashPassword
            user.email = email
            user.otp = otp
            user.otpExpiresAt = otpExpiresAt
            await user.save()
        } else {
            user = await User.create({
                name, email, password: hashPassword, otp, otpExpiresAt
            })
        }

        await sendMail(
            email,
            "Your otp for email verification",
            ` <!DOCTYPE html> <html> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> </head> <body style=" margin: 0; padding: 0; background-color: #f4f7fb; font-family: Arial, sans-serif; "> <div style=" max-width: 500px; margin: 40px auto; background-color: #ffffff; padding: 35px; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.08); "> <h1 style=" margin-bottom: 10px; color: #111827; font-size: 30px; "> RAAHI </h1> <p style=" color: #6b7280; font-size: 14px; margin-bottom: 30px; "> Move Smarter. Go Further. </p> <h2 style=" color: #111827; margin-bottom: 10px; "> Verify Your Email </h2> <p style=" color: #6b7280; font-size: 15px; line-height: 1.6; "> Your email verification OTP is: </p> <div style=" display: inline-block; margin: 20px 0; padding: 15px 30px; background-color: #f3f4f6; border: 2px dashed #111827; border-radius: 10px; "> <span style=" font-size: 32px; font-weight: bold; color:white; background-color:blue; letter-spacing: 8px; color: #111827; "> ${otp}</span> </div> <p style=" color: #9ca3af; font-size: 13px; margin-top: 20px; "> This OTP is valid for 5 minutes. </p> <p style=" color: #9ca3af; font-size: 12px; margin-top: 25px; "> If you didn't request this OTP, you can safely ignore this email. </p> </div> </body> </html> `
             
        )


        return NextResponse.json(
            user,
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: `register error : ${error}` },
            { status: 500 }
        )
    }
}