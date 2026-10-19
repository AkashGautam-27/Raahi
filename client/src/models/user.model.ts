import mongoose, { Document } from "mongoose";


type VideoKycStatus =
    "not_required"
    | "pending"
    | "in_progress"
    | "approved"
    | "rejected";
export interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    role: "user" | "partner" | "admin",
    partnerStatus?: "pending" | "approved" | "rejected",
    isEmailVerified?: boolean,
    otp?: string,
    otpExpiresAt?: Date,
    partnerOnBoardingSteps: number,
    mobileNumber?: string,
    rejectionReason?: string,
    videoKycStatus: VideoKycStatus,
    videoKycRoomId: string,
    videoKycRejectionReason: string,
    createdAt: Date,
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        unique: true,
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "partner", "admin"]
    },
    partnerStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpiresAt: {
        type: Date
    },
    partnerOnBoardingSteps: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    mobileNumber: {
        type: String
    },
    videoKycStatus: {
        type: String,
        enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
        default: "not_required"
    },
    videoKycRoomId: {
        type: String
    },
    videoKycRejectionReason: {
        type: String
    },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User