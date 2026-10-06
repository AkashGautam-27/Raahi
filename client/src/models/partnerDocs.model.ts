import mongoose from "mongoose";
interface IPartnerDocs {
    owner: mongoose.Types.ObjectId,
    rejectionReason?: string,
    aadharUrl?: string,
    rcUrl?: string,
    licenseUrl?: string,
    status: "approved" | "pending" | "rejected",
    createdAt: Date,
    updatedAt: Date

}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rejectionReason: { type: String },
    aadharUrl: { type: String },
    rcUrl: { type: String },
    licenseUrl: { type: String },
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" }
}, { timestamps: true })

const PartnerDocs = mongoose.models.PartnerDocs || mongoose.model<IPartnerDocs>("PartnerDocs", partnerDocsSchema)

export default PartnerDocs