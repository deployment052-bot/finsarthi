import LoanProduct from "./loanProduct.model.js";
import LoanProductDocument from "../loan-products/LoanProductDocument.model.js";
import DocumentMaster from "../loan-products/DocumentMaster.model.js";
const formatCategoryName = (category) => {
  if (!category) {
    return "";
  }

  return category
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

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

    // Get document IDs
    const documentIds = documents.map(
      (d) => d.documentId
    );

    // Duplicate check
    const uniqueDocumentIds = [
      ...new Set(
        documentIds.map((id) => id.toString())
      ),
    ];

    if (uniqueDocumentIds.length !== documentIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate documents are not allowed",
      });
    }

    // Validate documents
    const existingDocs = await DocumentMaster.find({
      _id: { $in: documentIds },
      active: true,
    });

    if (existingDocs.length !== documentIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more documents are invalid",
      });
    }

    // Check already assigned documents
    const existingMappings =
      await LoanProductDocument.find({
        loanProduct: id,
        document: { $in: documentIds },
      });

    const alreadyAssigned = new Set(
      existingMappings.map((mapping) =>
        mapping.document.toString()
      )
    );

    // Only create NEW mappings
    const newDocuments = documents.filter(
      (doc) =>
        !alreadyAssigned.has(
          doc.documentId.toString()
        )
    );

    if (newDocuments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All documents are already assigned",
      });
    }

    // Get last display order
    const lastMapping =
      await LoanProductDocument.findOne({
        loanProduct: id,
      }).sort({
        displayOrder: -1,
      });

    let nextDisplayOrder =
      lastMapping?.displayOrder || 0;

    // Create only new mappings
    const mappings = newDocuments.map((doc) => ({
      loanProduct: id,
      document: doc.documentId,
      mandatory: doc.mandatory ?? true,
      displayOrder:
        doc.displayOrder ??
        ++nextDisplayOrder,
      active: true,
    }));

    await LoanProductDocument.insertMany(
      mappings
    );

    return res.status(200).json({
      success: true,
      message: "Documents assigned successfully",
      data: mappings,
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




// ==========================================
// GET ALL LOAN PRODUCTS
// ==========================================

export const getLoanProducts = async (req, res) => {
  try {
    const products = await LoanProduct.find({
      active: true,
      code: {
        $exists: true,
        $ne: "",
      },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    const formattedProducts = await Promise.all(
      products.map(async (product) => {

        // ==========================================
        // FETCH ASSIGNED DOCUMENTS
        // ==========================================

        const documentMappings =
          await LoanProductDocument.find({
            loanProduct: product._id,
            active: true,
          })
            .populate(
              "document",
              "name code description allowedTypes maxSizeMB"
            )
            .sort({
              displayOrder: 1,
            })
            .lean();

        const documents = documentMappings
          .filter((item) => item.document)
          .map((item) => ({
            mappingId: item._id,

            documentId: item.document._id,

            name: item.document.name,

            code: item.document.code,

            description: item.document.description,

            allowedTypes:
              item.document.allowedTypes,

            maxSizeMB:
              item.document.maxSizeMB,

            mandatory: item.mandatory,

            displayOrder: item.displayOrder,
          }));


        // ==========================================
        // FINAL PRODUCT RESPONSE
        // ==========================================

        return {
          ...product,

          categoryName: formatCategoryName(
            product.category
          ),

          processingType:
            product.processingType ||
            (product.type === "INSTANT"
              ? "INSTANT"
              : "MANUAL"),

          amount: {
            min: product.minAmount,
            max: product.maxAmount,
          },

          tenure: {
            min: product.minTenure,
            max: product.maxTenure,
          },

          interest: {
            rate: product.interestRate,
            type: product.interestType,
          },

          charges: {
            processingFee: product.processingFee,
            processingFeeType:
              product.processingFeeType,
            gstPercentage:
              product.gstPercentage,
          },

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
    console.error(
      "Get Loan Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getLoanCategories = async (req, res) => {
  try {
    // ==========================================
    // FETCH ACTIVE LOAN PRODUCTS
    // ==========================================

    const products = await LoanProduct.find({
      active: true,
      code: {
        $exists: true,
        $ne: "",
      },
    })
      .select(`
        name
        code
        category
        type
        processingType
        description

        minAmount
        maxAmount

        minTenure
        maxTenure

        interestRate
        interestType

        emiFrequency

        processingFee
        processingFeeType
        gstPercentage

        minRiskScore
        maxActiveLoans

        instantDisbursement
        requiresPhysicalVerification

        overdue

        formConfiguration

        active
        createdAt
        updatedAt
      `)
      .sort({
        createdAt: -1,
      })
      .lean();

    // ==========================================
    // FETCH DOCUMENTS FOR EACH PRODUCT
    // ==========================================

    const productsWithDocuments = await Promise.all(
      products.map(async (product) => {
        const documentMappings =
          await LoanProductDocument.find({
            loanProduct: product._id,
            active: true,
          })
            .populate(
              "document",
              "name code description allowedTypes maxSizeMB"
            )
            .sort({
              displayOrder: 1,
            })
            .lean();

        const documents = documentMappings
          .filter((item) => item.document)
          .map((item) => ({
            mappingId: item._id,

            documentId: item.document._id,

            name: item.document.name,

            code: item.document.code,

            description:
              item.document.description,

            allowedTypes:
              item.document.allowedTypes,

            maxSizeMB:
              item.document.maxSizeMB,

            mandatory:
              item.mandatory,

            displayOrder:
              item.displayOrder,
          }));

        return {
          ...product,
          documents,
        };
      })
    );

    // ==========================================
    // GROUP DATA
    // ==========================================

    const categoryMap = new Map();

    for (const product of productsWithDocuments) {
      // ==========================================
      // DETERMINE CATEGORY
      // ==========================================

      let category = product.category;

      // Agar category missing hai aur loan
      // INSTANT hai
      if (
        (!category || category === "") &&
        (
          product.processingType === "INSTANT" ||
          product.type === "INSTANT"
        )
      ) {
        category = "INSTANT";
      }

      // Invalid category skip
      if (!category) {
        continue;
      }

      category = category.toUpperCase();

      // ==========================================
      // DETERMINE LOAN TYPE
      // ==========================================

      let loanType =
        product.processingType ||
        product.type ||
        "MANUAL";

      loanType = loanType.toUpperCase();

      // Agar category INSTANT hai
      if (category === "INSTANT") {
        loanType = "INSTANT";
      }

      // ==========================================
      // CREATE CATEGORY
      // ==========================================

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,

          name:
            category === "INSTANT"
              ? "Instant Loan"
              : formatCategoryName(category),

          products: [],
        });
      }

      const categoryData =
        categoryMap.get(category);

      // ==========================================
      // ADD PRODUCT
      // ==========================================

      categoryData.products.push({
        ...product,

        category,

        categoryName:
          category === "INSTANT"
            ? "Instant Loan"
            : formatCategoryName(category),

        processingType: loanType,

        processingTypeName:
          loanType === "INSTANT"
            ? "Instant"
            : "Manual",

        amount: {
          min: product.minAmount,
          max: product.maxAmount,
        },

        tenure: {
          min: product.minTenure,
          max: product.maxTenure,
        },

        interest: {
          rate: product.interestRate,
          type: product.interestType,
        },

        charges: {
          processingFee:
            product.processingFee,

          processingFeeType:
            product.processingFeeType,

          gstPercentage:
            product.gstPercentage,
        },

        // Documents already fetched above
        documents: product.documents || [],
      });
    }

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    const formattedCategories =
      Array.from(categoryMap.values()).map(
        (categoryData) => {

          const products =
            categoryData.products;

          // ======================================
          // ONLY ONE LOAN PRODUCT
          // ======================================

          if (products.length === 1) {
            const product = products[0];

            return {
              category:
                categoryData.category,

              name:
                categoryData.name,

              loanCount: 1,

              type: {
                type:
                  product.processingType,

                name:
                  product.processingTypeName,
              },

              // Complete loan details
              loan: product,
            };
          }

          // ======================================
          // MULTIPLE LOAN PRODUCTS
          // ======================================

          const typeMap = new Map();

          for (const product of products) {
            const type =
              product.processingType;

            if (!typeMap.has(type)) {
              typeMap.set(type, {
                type,

                name:
                  type === "INSTANT"
                    ? "Instant"
                    : "Manual",

                loanCount: 0,
              });
            }

            typeMap.get(type).loanCount += 1;
          }

          return {
            category:
              categoryData.category,

            name:
              categoryData.name,

            types:
              Array.from(
                typeMap.values()
              ),
          };
        }
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      count:
        formattedCategories.length,

      data: formattedCategories,
    });

  } catch (error) {
    console.error(
      "Get Loan Categories Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getLoanProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category?.trim().toUpperCase();

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Loan category is required",
      });
    }

    // ==========================================
    // FIND LOANS BY CATEGORY
    //
    // For INSTANT:
    // category = INSTANT
    // OR type = INSTANT
    // OR processingType = INSTANT
    // ==========================================

    const query = {
      active: true,

      code: {
        $exists: true,
        $ne: "",
      },

      $or: [
        {
          category: category,
        },
        {
          type: category,
        },
        {
          processingType: category,
        },
      ],
    };

    const products = await LoanProduct.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();

    // ==========================================
    // NO PRODUCTS
    // ==========================================

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: `No active loan products found for ${category}`,
        data: [],
      });
    }

    // ==========================================
    // FORMAT PRODUCTS
    // ==========================================

    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        // ==========================================
        // FETCH ASSIGNED DOCUMENTS
        // ==========================================

        const documentMappings =
          await LoanProductDocument.find({
            loanProduct: product._id,
            active: true,
          })
            .populate(
              "document",
              "name code description allowedTypes maxSizeMB"
            )
            .sort({
              displayOrder: 1,
            })
            .lean();

        // ==========================================
        // FORMAT DOCUMENTS
        // ==========================================

        const documents = documentMappings
          .filter((item) => item.document)
          .map((item) => ({
            mappingId: item._id,

            documentId: item.document._id,

            name: item.document.name,

            code: item.document.code,

            description:
              item.document.description,

            allowedTypes:
              item.document.allowedTypes,

            maxSizeMB:
              item.document.maxSizeMB,

            mandatory: item.mandatory,

            displayOrder:
              item.displayOrder,
          }));

        // ==========================================
        // DETERMINE PROCESSING TYPE
        // ==========================================

        const processingType =
          product.processingType ||
          (product.type === "INSTANT"
            ? "INSTANT"
            : "MANUAL");

        // ==========================================
        // FINAL RESPONSE
        // ==========================================

        return {
          ...product,

          category:
            product.category || category,

          categoryName:
            product.category === "INSTANT" ||
            product.type === "INSTANT"
              ? "Instant Loan"
              : formatCategoryName(
                  product.category
                ),

          processingType,

          processingTypeName:
            processingType === "INSTANT"
              ? "Instant"
              : "Manual",

          amount: {
            min: product.minAmount,
            max: product.maxAmount,
          },

          tenure: {
            min: product.minTenure,
            max: product.maxTenure,
          },

          interest: {
            rate: product.interestRate,
            type: product.interestType,
          },

          charges: {
            processingFee:
              product.processingFee,

            processingFeeType:
              product.processingFeeType,

            gstPercentage:
              product.gstPercentage,
          },

          documents,
        };
      })
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      category,

      categoryName:
        category === "INSTANT"
          ? "Instant Loan"
          : formatCategoryName(category),

      count: formattedProducts.length,

      data: formattedProducts,
    });

  } catch (error) {
    console.error(
      "Get Loan Products By Category Error:",
      error
    );

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