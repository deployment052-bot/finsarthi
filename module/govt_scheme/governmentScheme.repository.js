import GovernmentScheme from "./governmentScheme.model.js";

class GovernmentSchemeRepository {

  // ==========================================
  // CREATE
  // ==========================================
  async create(payload) {
    return GovernmentScheme.create(payload);
  }

  // ==========================================
  // BULK CREATE
  // ==========================================
  async bulkCreate(payload) {
    return GovernmentScheme.insertMany(payload);
  }

  // ==========================================
  // FIND BY ID
  // ==========================================
  async findById(id) {
    return GovernmentScheme.findById(id);
  }

  // ==========================================
  // FIND BY SCHEME ID
  // ==========================================
  async findBySchemeId(schemeId) {
    return GovernmentScheme.findOne({ schemeId });
  }

  // ==========================================
  // FIND BY NAME
  // ==========================================
  async findByName(name) {
    return GovernmentScheme.findOne({
      name: {
        $regex: `^${name}$`,
        $options: "i",
      },
    });
  }

  // ==========================================
  // GET ALL
  // ==========================================
  async findAll(filter = {}, options = {}) {

    const {

      page = 1,

      limit = 20,

      sort = {
        createdAt: -1,
      },

    } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([

      GovernmentScheme.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      GovernmentScheme.countDocuments(filter),

    ]);

    return {

      data,

      total,

      page,

      totalPages: Math.ceil(total / limit),

    };
  }

  // ==========================================
  // UPDATE
  // ==========================================
  async update(id, payload) {

    return GovernmentScheme.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
      }
    );

  }

  // ==========================================
  // UPSERT
  // ==========================================
  async upsert(filter, payload) {

    return GovernmentScheme.findOneAndUpdate(
      filter,
      payload,
      {
        new: true,
        upsert: true,
      }
    );

  }

  // ==========================================
  // DELETE
  // ==========================================
  async delete(id) {

    return GovernmentScheme.findByIdAndDelete(id);

  }

  // ==========================================
  // BULK UPSERT
  // ==========================================
  async bulkUpsert(records = []) {

    if (!records.length) return [];

    const operations = records.map((item) => ({

      updateOne: {

        filter: {

          schemeId: item.schemeId,

        },

        update: {

          $set: item,

        },

        upsert: true,

      },

    }));

    return GovernmentScheme.bulkWrite(operations);

  }

  // ==========================================
  // GET CATEGORIES
  // ==========================================
  async getCategories() {

    return GovernmentScheme.distinct("category");

  }

  // ==========================================
  // GET STATES
  // ==========================================
  async getStates() {

    return GovernmentScheme.distinct("state");

  }

  // ==========================================
  // SEARCH
  // ==========================================
  async search(keyword) {

    return GovernmentScheme.find({

      $or: [

        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          ministry: {
            $regex: keyword,
            $options: "i",
          },
        },

      ],

    });

  }

}

export default new GovernmentSchemeRepository();