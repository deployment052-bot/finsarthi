import GovernmentScheme from "./governmentScheme.model.js";

class GovernmentSchemeController {
  // GET /government-schemes
// GET /government-schemes
async getAll(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      state,
      ministry,
      search,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // Category Filter
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // State Filter
    if (state) {
      filter.state = {
        $regex: `^${state}$`,
        $options: "i",
      };
    }

    // Ministry Filter
    if (ministry) {
      filter.ministry = {
        $regex: `^${ministry}$`,
        $options: "i",
      };
    }

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ministry: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          state: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await GovernmentScheme.countDocuments(filter);

    const schemes = await GovernmentScheme.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: schemes.length,
      data: schemes,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

  // GET /government-schemes/:id
  async getById(req, res) {
    try {

      const scheme =
        await GovernmentScheme.findById(req.params.id);

      if (!scheme) {
        return res.status(404).json({
          success: false,
          message: "Scheme not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: scheme,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }

  // POST /government-schemes
  async create(req, res) {
    try {

      const scheme =
        await GovernmentScheme.create(req.body);

      return res.status(201).json({
        success: true,
        data: scheme,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }

  // PUT /government-schemes/:id
  async update(req, res) {
    try {

      const scheme =
        await GovernmentScheme.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      return res.status(200).json({
        success: true,
        data: scheme,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }

  // DELETE /government-schemes/:id
  async delete(req, res) {
    try {

      await GovernmentScheme.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Scheme deleted successfully",
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
}

export default new GovernmentSchemeController();