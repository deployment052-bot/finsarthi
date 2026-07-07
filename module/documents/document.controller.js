import Document from "./document.model.js";

export const uploadDocuments = async (
  req,
  res
) => {
  try {
    const docs =
      await Document.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          user: req.user._id,
          ...req.body,
        },
        {
          upsert: true,
          new: true,
        }
      );

    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyDocuments = async (
  req,
  res
) => {
  try {
    const docs =
      await Document.findOne({
        user: req.user._id,
      });

    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};