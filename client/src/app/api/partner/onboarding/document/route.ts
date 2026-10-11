// // import { auth } from "@/auth";
// // import uploadOnCloudinary from "@/lib/cloudinary";
// // import connectDB from "@/lib/db";
// // import PartnerDocs from "@/models/partnerDocs.model";
// // import User from "@/models/user.model";
// // import { NextRequest, NextResponse} from "next/server";

// // export async function POST(req:NextRequest,res:NextResponse){
// //     console.log("api hit")
// //     try {
// //          await connectDB();
// //         const session = await auth();
// //         if (!session || !session.user?.email) {
// //             return Response.json(
// //                 { message: "Unauthorized" },
// //                 { status: 400 }
// //             )
// //         }
// //         const user = await User.findOne({ email: session.user.email })
// //         if (!user) {
// //             return Response.json(
// //                 { message: "User not found" },  
// //                 { status: 400 }
// //             )
// //         }

// //         const formData = await req.formData();
// //         const aadhar= formData.get("aadhar") as Blob | null;
// //         const license= formData.get("license") as Blob | null;
// //         const rc= formData.get("rc") as Blob | null;
// //         if(!aadhar || !license || !rc){
// //               return Response.json(
// //                 { message: "all documents are required" },  
// //                 { status: 400 }
// //             )
// //         }

// //         const updatePayload:any={
// //             status:"pending"
// //         } 

// //         if(aadhar){
// //             const url = await uploadOnCloudinary(aadhar)
// //             if(!url){
// //                  return Response.json(
// //                 { message: "aadhar upload failed" },  
// //                 { status: 500 }
// //             )
// //             }
// //             updatePayload.aadharUrl=url
// //         }

// //            if(license){
// //             const url = await uploadOnCloudinary(license)
// //             if(!url){
// //                  return Response.json(
// //                 { message: "license upload failed" },  
// //                 { status: 500 }
// //             )
// //             }
// //             updatePayload.licenseUrl=url
// //         }

// //            if(rc){
// //             const url = await uploadOnCloudinary(rc)
// //             if(!url){
// //                  return Response.json(
// //                 { message: "rc upload failed" },  
// //                 { status: 500 }
// //             )
// //             }
// //             updatePayload.rcUrl=url
// //         }
    
    
// //         const partnerDocs =await PartnerDocs.findOneAndUpdate({owner:user._id},{$set:updatePayload},{upsert:true,new:true,  runValidators: true,
// //     setDefaultsOnInsert: true,})

// //           if(user.partnerOnBoardingSteps<2){
// //             user.partnerOnBoardingSteps=2
// //         }
// //         await user.save();
// //             return Response.json(partnerDocs, { status: 201 })
    
    
// //     } catch (error) {
// //   console.error("Documents API error:", error);

// //   return NextResponse.json(
// //     {
// //       message: "Document upload failed",
// //       error:
// //         error instanceof Error
// //           ? error.message
// //           : JSON.stringify(error),
// //     },
// //     { status: 500 }
// //   );
// // }
// // }



// import { auth } from "@/auth";
// import uploadOnCloudinary from "@/lib/cloudinary";
// import connectDB from "@/lib/db";
// import PartnerDocs from "@/models/partnerDocs.model";
// import User from "@/models/user.model";
// import { NextRequest, NextResponse } from "next/server";

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// const ALLOWED_MIME_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "application/pdf",
// ];

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Connect to MongoDB
//     await connectDB();

//     // 2. Authenticate user
//     const session = await auth();

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // 3. Find logged-in user
//     const user = await User.findOne({
//       email: session.user.email,
//     });

//     if (!user) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // 4. Read multipart form data
//     const formData = await req.formData();

//     const aadhar = formData.get("aadhar");
//     const license = formData.get("license");
//     const rc = formData.get("rc");

//     const documents = [
//       { key: "aadhar", file: aadhar },
//       { key: "license", file: license },
//       { key: "rc", file: rc },
//     ];

//     // 5. Validate all documents
//     for (const document of documents) {
//       const file = document.file;

//       if (
//         typeof File === "undefined" ||
//         !(file instanceof File) ||
//         file.size === 0
//       ) {
//         return NextResponse.json(
//           {
//             message: `${document.key} document is required`,
//           },
//           { status: 400 }
//         );
//       }

//       if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//         return NextResponse.json(
//           {
//             message: `${document.key} must be JPG, PNG or PDF`,
//           },
//           { status: 400 }
//         );
//       }

//       if (file.size > MAX_FILE_SIZE) {
//         return NextResponse.json(
//           {
//             message: `${document.key} must not exceed 5 MB`,
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // 6. Upload a single document to Cloudinary
//     const uploadDocument = async (
//       file: File,
//       documentName: string
//     ): Promise<string> => {
//       const result = await uploadOnCloudinary(file);

//       if (result.error || !result.url) {
//         console.error(
//           `${documentName} Cloudinary upload failed:`,
//           result.error
//         );

//         throw new Error(`${documentName} upload failed`);
//       }

//       return result.url;
//     };

//     // 7. Upload all three documents
//     const aadharUrl = await uploadDocument(
//       aadhar as File,
//       "Aadhaar"
//     );

//     const licenseUrl = await uploadDocument(
//       license as File,
//       "Driving licence"
//     );

//     const rcUrl = await uploadDocument(
//       rc as File,
//       "Registration certificate"
//     );

//     // 8. Save URLs in MongoDB
//     const partnerDocs = await PartnerDocs.findOneAndUpdate(
//       { owner: user._id },
//       {
//         $set: {
//           aadharUrl,
//           licenseUrl,
//           rcUrl,
//           status: "pending",
//         },
//         $setOnInsert: {
//           owner: user._id,
//         },
//       },
//       {
//         upsert: true,
//         new: true,
//         runValidators: true,
//         setDefaultsOnInsert: true,
//       }
//     );

//     // 9. Update partner onboarding step
//     if (user.partnerOnBoardingSteps < 2) {
//       user.partnerOnBoardingSteps = 2;
//       await user.save();
//     }

//     // 10. Send success response
//     return NextResponse.json(
//       {
//         message: "Documents uploaded successfully",
//         partnerDocs: {
//           status: partnerDocs.status,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Partner documents API error:", error);

//     return NextResponse.json(
//       {
//         message:
//           error instanceof Error
//             ? error.message
//             : "Document upload failed",
//       },
//       { status: 500 }
//     );
//   }
// }



import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req: NextRequest) {
    console.log("api hit")
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Authenticate user
    const session = await auth();
    console.log("SESSION DEBUG:", {
  userId: session?.user?.id,
  email: session?.user?.email,
});

const dbUserCount = await User.countDocuments();

console.log("TOTAL USERS IN DB:", dbUserCount);


    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const email = session.user.email.trim().toLowerCase();

    // 3. Find user in MongoDB

    
// 3. Find logged-in user using session ID first
const sessionUserId = session.user.id;

let user = null;

if (sessionUserId) {
  user = await User.findById(sessionUserId);
}
console.log("FOUND USER:", user ? {
  id: user._id.toString(),
  email: user.email,
} : null);

// Fallback: find by email
if (!user && session.user.email) {
  const email = session.user.email.trim();

  user = await User.findOne({
    email: {
      $regex: `^${escapeRegex(email)}$`,
      $options: "i",
    },
  });
}

if (!user) {
  console.error("User lookup failed:", {
    sessionUserId: session.user.id,
    sessionEmail: session.user.email,
  });

  return NextResponse.json(
    { message: "User not found. Please sign in again." },
    { status: 404 }
  );
}

    // const user = await User.findOne({
    //   email: { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") },
    // });

    // if (!user) {
    //   console.error("User not found for session email:", email);

    //   return NextResponse.json(
    //     {
    //       message: "User not found in database",
    //       email,
    //     },
    //     { status: 404 }
    //   );
    // }

    // 4. Read form data
    const formData = await req.formData();

    const aadhar = formData.get("aadhar");
    const license = formData.get("license");
    const rc = formData.get("rc");

    const documents = [
      { key: "aadhar", file: aadhar },
      { key: "license", file: license },
      { key: "rc", file: rc },
    ];

    // 5. Validate documents
    for (const document of documents) {
      const file = document.file;

      if (
        typeof File === "undefined" ||
        !(file instanceof File) ||
        file.size === 0
      ) {
        return NextResponse.json(
          { message: `${document.key} document is required` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message: `${document.key} must be JPG, PNG, or PDF`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            message: `${document.key} must not exceed 5 MB`,
          },
          { status: 400 }
        );
      }
    }


// 6. Upload document to Cloudinary
const uploadDocument = async (
  file: File,
  documentName: string
): Promise<string> => {
  try {
    const url = await uploadOnCloudinary(file);

    if (!url) {
      throw new Error(`${documentName} upload failed: no URL returned`);
    }

    return url;
  } catch (error: any) {
    console.error(`${documentName} upload failed:`, error);
    const detail =
      error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error));
    throw new Error(`${documentName} upload failed: ${detail}`);
  }
};

    // 7. Upload all documents
    const [aadharUrl, licenseUrl, rcUrl] = await Promise.all([
      uploadDocument(aadhar as File, "Aadhaar"),
      uploadDocument(license as File, "Driving licence"),
      uploadDocument(rc as File, "RC"),
    ]);

    // 8. Save document URLs
    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      {
        $set: {
          aadharUrl,
          licenseUrl,
          rcUrl,
          status: "pending",
        },
        $setOnInsert: {
          owner: user._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // 9. Update onboarding step
    if ((user.partnerOnBoardingSteps ?? 0) < 2) {
      user.partnerOnBoardingSteps = 2;
      await user.save();
    }

    // 10. Success response
    return NextResponse.json(
      {
        message: "Documents uploaded successfully",
        partnerDocs: {
          status: partnerDocs.status,
          aadharUrl: partnerDocs.aadharUrl,
          licenseUrl: partnerDocs.licenseUrl,
          rcUrl: partnerDocs.rcUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Partner documents API error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Document upload failed",
      },
      { status: 500 }
    );
  }
}

