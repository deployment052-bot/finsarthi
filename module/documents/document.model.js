import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
{
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  application:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"LoanApplication"
  },

  aadhaarFrontUrl:String,

  aadhaarBackUrl:String,

  panCardUrl:String,

  selfieUrl:String,

  bankStatementUrl:String,

  salarySlipUrl:String,

  status:{
    type:String,
    enum:[
      "PENDING",
      "APPROVED",
      "REJECTED"
    ],
    default:"PENDING"
  }
},
{
  timestamps:true
}
);

export default mongoose.model("Document",documentSchema);