import mongoose from "mongoose";
export interface IPartnerBank {
    owner: mongoose.Types.ObjectId;
    accountHolderName?: string;
    accountHolder?: string;
    accountNumber: string;
    ifscCode?: string;
    ifsc?: string;
    upiId?: string;
    upi?: string;
    status: "not_added" | "added" | "verified";
    createdAt: Date;
    updatedAt: Date;
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountHolderName: { type: String },
    accountHolder: { type: String },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, uppercase: true },
    ifsc: { type: String, uppercase: true },
    upiId: { type: String },
    upi: { type: String },
    status: { type: String, enum: ["not_added", "added", "verified"], default: "not_added" }
}, { timestamps: true, strict: false })

const PartnerBank = mongoose.models.PartnerBank || mongoose.model<IPartnerBank>("PartnerBank", partnerBankSchema)
export default PartnerBank