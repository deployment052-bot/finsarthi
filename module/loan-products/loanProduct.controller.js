import LoanProduct from "./loanProduct.model.js";
import LoanProductDocument from "../loan-products/LoanProductDocument.model.js";
import DocumentMaster from "../loan-products/DocumentMaster.model.js";

// Create Loan Product
// import LoanProduct from "./loanProduct.model.js";

export const createLoanProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      processingType,
      category,
      minAmount,
      maxAmount,
      minTenure,
      maxTenure,
      interestRate,
    } = req.body;

    // Basic Validation
    if (
      !code ||
      !name ||
      !processingType ||
      !minAmount ||
      !maxAmount ||
      !minTenure ||
      !maxTenure ||
      !interestRate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Duplicate Code Check
    const existingProduct = await LoanProduct.findOne({
      code: code.toUpperCase(),
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Loan product code already exists.",
      });
    }

    // Create Product
    const product = await LoanProduct.create({
      ...req.body,
      code: code.toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message:
        processingType === "MANUAL"
          ? "Manual loan product created. Now assign required documents."
          : "Instant loan product created successfully.",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const assignDocumentsToLoanProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;

    // Check Loan Product
    const loanProduct = await LoanProduct.findById(id);

    if (!loanProduct) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Documents are required",
      });
    }

    // Validate document ids
    const documentIds = documents.map((d) => d.documentId);

    const existingDocs = await DocumentMaster.find({
      _id: { $in: documentIds },
    });

    if (existingDocs.length !== documentIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more documents are invalid",
      });
    }

    // Delete old mappings
    await LoanProductDocument.deleteMany({
      loanProduct: id,
    });

    // Create new mappings
    const mappings = documents.map((doc, index) => ({
      loanProduct: id,
      document: doc.documentId,
      mandatory: doc.mandatory ?? true,
      displayOrder: doc.displayOrder ?? index + 1,
    }));

    await LoanProductDocument.insertMany(mappings);

    return res.status(200).json({
      success: true,
      message: "Documents assigned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignedDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const mappings = await LoanProductDocument.find({
      loanProduct: id,
    })
      .populate("document", "name code")
      .sort({ displayOrder: 1 });

    return res.status(200).json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const createDocument = async (req, res) => {
  try {
    const payload = req.body;

    // ---------- Bulk Create ----------
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Documents array cannot be empty",
        });
      }

      // Validate required fields
      for (const doc of payload) {
        if (!doc.name || !doc.code) {
          return res.status(400).json({
            success: false,
            message: "Each document must have name and code",
          });
        }

        doc.code = doc.code.toUpperCase();
      }

      // Check duplicate codes in request
      const codes = payload.map((d) => d.code);

      if (new Set(codes).size !== codes.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate document codes found in request",
        });
      }

      // Check existing codes in DB
      const existing = await DocumentMaster.find({
        code: { $in: codes },
      });

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Document code(s) already exist: ${existing
            .map((d) => d.code)
            .join(", ")}`,
        });
      }

      const documents = await DocumentMaster.insertMany(payload);

      return res.status(201).json({
        success: true,
        message: `${documents.length} documents created successfully`,
        data: documents,
      });
    }

    // ---------- Single Create ----------
    const { name, code } = payload;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    const upperCode = code.toUpperCase();

    const exists = await DocumentMaster.findOne({
      code: upperCode,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Document code already exists",
      });
    }

    const document = await DocumentMaster.create({
      ...payload,
      code: upperCode,
    });

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateDocument = async (req, res) => {
  try {
    const document = await DocumentMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await DocumentMaster.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Loan Products
export const getLoanProducts = async (req, res) => {
  try {
    const products = await LoanProduct.find({
      active: true,
      code: { $exists: true, $ne: "" },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        // Fetch documents assigned to this product
        const documentMappings = await LoanProductDocument.find({
          loanProduct: product._id,
        })
          .populate("document")
          .lean();

        const documents = documentMappings.map((item) => ({
          documentId: item.document?._id,
          name: item.document?.name,
          code: item.document?.code,
          mandatory: item.mandatory,
        }));

        return {
          ...product,

          // Consistent loan processing type
          processingType:
            product.processingType ||
            (product.type === "INSTANT"
              ? "INSTANT"
              : "MANUAL"),

          // Assigned documents
          documents,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Get Loan Products Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Loan Product
export const getLoanProductById = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    // Fetch assigned documents
    const assignedDocuments = await LoanProductDocument.find({
      loanProduct: product._id,
    })
      .populate("document", "name code description allowedTypes maxSizeMB")
      .sort({ displayOrder: 1 });

    return res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        requiredDocuments: assignedDocuments.map((item) => ({
          mappingId: item._id,
          documentId: item.document._id,
          name: item.document.name,
          code: item.document.code,
          description: item.document.description,
          allowedTypes: item.document.allowedTypes,
          maxSizeMB: item.document.maxSizeMB,
          mandatory: item.mandatory,
          displayOrder: item.displayOrder,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Loan Product
export const updateLoanProduct = async (req, res) => {
  try {
    const product = await LoanProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Loan product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Loan Product
export const deleteLoanProduct = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Loan product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Enable / Disable Loan Product
export const toggleLoanProductStatus = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    product.active = !product.active;

    await product.save();

    return res.status(200).json({
      success: true,
      message: `Loan product ${
        product.active ? "enabled" : "disabled"
      } successfully`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};