import mongoose from "mongoose";

type VehicleType = "bike" | "car" | "truck" | "bus" | "loading" | "auto" | "other"


interface IVehicle{
    owner:mongoose.Types.ObjectId,
    type: VehicleType,
    vehicleNumber:string,
    vehicleModel:string,
    imageUrl?:string,
    baseFare?:number,
    pricePerKm?:number,
    waitingChargePerHour?:number,
    status:"approved"|"pending"|"rejected",
    rejectionReason?:string,
    isActive:boolean,
    createdAt:Date,
    updatedAt:Date
}


const vehicleSchema= new mongoose.Schema<IVehicle>({
    owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    type:{type:String,enum:["bike","car","truck","bus","loading","auto","other"],required:true},
    vehicleNumber:{type:String,required:true,unique:true},
    vehicleModel:{type:String,required:true},
    imageUrl:{type:String},
    baseFare:{type:Number,default:0},
    pricePerKm:{type:Number,default:0},
    waitingChargePerHour:{type:Number,default:0},
    status:{type:String,enum:["approved","pending","rejected"],default:"pending"},
    rejectionReason:{type:String},
    isActive:{type:Boolean,default:true}  
},{timestamps:true})

const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle",vehicleSchema)

export default Vehicle