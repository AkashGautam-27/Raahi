import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse} from "next/server";

export async function POST(req:NextRequest,res:NextResponse){
    console.log("api hit")
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

        const formData = await req.formData();
        const aadhar= formData.get("aadhar") as Blob | null;
        const license= formData.get("license") as Blob | null;
        const rc= formData.get("rc") as Blob | null;
        if(!aadhar || !license || !rc){
              return Response.json(
                { message: "all documents are required" },  
                { status: 400 }
            )
        }

        const updatePayload:any={
            status:"pending"
        } 

        if(aadhar){
            const url = await uploadOnCloudinary(aadhar)
            if(!url){
                 return Response.json(
                { message: "aadhar upload failed" },  
                { status: 500 }
            )
            }
            updatePayload.aadharUrl=url
        }

           if(license){
            const url = await uploadOnCloudinary(license)
            if(!url){
                 return Response.json(
                { message: "license upload failed" },  
                { status: 500 }
            )
            }
            updatePayload.licenseUrl=url
        }

           if(rc){
            const url = await uploadOnCloudinary(rc)
            if(!url){
                 return Response.json(
                { message: "rc upload failed" },  
                { status: 500 }
            )
            }
            updatePayload.rcUrl=url
        }
    
    
        const partnerDocs =await PartnerDocs.findOneAndUpdate({owner:user._id},{$set:updatePayload},{upsert:true,new:true,  runValidators: true,
    setDefaultsOnInsert: true,})

          if(user.partnerOnBoardingSteps<2){
            user.partnerOnBoardingSteps=2
        }
        await user.save();
            return Response.json(partnerDocs, { status: 201 })
    
    
    } catch (error) {
  console.error("Documents API error:", error);

  return NextResponse.json(
    {
      message: "Document upload failed",
      error:
        error instanceof Error
          ? error.message
          : JSON.stringify(error),
    },
    { status: 500 }
  );
}
}