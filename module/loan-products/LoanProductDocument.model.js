import mongoose from "mongoose";

const loanProductDocumentSchema = new mongoose.Schema(
  {
    loanProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
    },

    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentMaster",
      required: true,
    },

    mandatory: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 1,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same document ko same loan me dobara map hone se rokega
loanProductDocumentSchema.index(
  {
    loanProduct: 1,
    document: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "LoanProductDocument",
  loanProductDocumentSchema
);