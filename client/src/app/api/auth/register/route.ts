import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        const {name,email,password} = await req.json();
        await connectDB();
        let user = await User.findOne({email})
        if(user && user.isEmailVerified){
            return NextResponse.json(
                {message:"email already exist"},
                {status:400}
            )
        }

        const otp = Math.floor(100000+Math.random()*900000).toString()
        const otpExpiresAt = new Date(Date.now()+10*60*1000)



        if(password.length<6){
            return NextResponse.json(
                {message:"password must be at least 6 characters"},
                {status:400}
            )
        }


        const hashPassword = await bcrypt.hash(password,10)
        if(user && !user.isEmailVerified){
            user.name=name
            user.password=hashPassword
            user.email=email
            user.otp=otp
            user.otpExpiresAt=otpExpiresAt
            await user.save()
        }else{
            user=await User.create({
            name,email,password:hashPassword,otp,otpExpiresAt
        })
    }

    await sendMail(
        email,
        "Your otp for email verification",
        `<h2> Your email verification otp is <strong>${otp}</strong></h2>`
    )

    
        return NextResponse.json(
                user,
                {status:201}
            )
    } catch (error) {
        return NextResponse.json(
                {message:`register error : ${error}`},
                {status:500}
            )
    }
}