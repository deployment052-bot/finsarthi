import governmentSchemeRepository from "./governmentScheme.repository.js";

class GovernmentSchemeService {

  // ==========================================
  // CREATE SCHEME
  // ==========================================
  async create(payload) {

    const existing =
      await governmentSchemeRepository.findByName(
        payload.name
      );

    if (existing) {
      throw new Error("Scheme already exists");
    }

    return governmentSchemeRepository.create(payload);

  }

  // ==========================================
  // GET ALL SCHEMES
  // ==========================================
  async getAll(query) {

    const {
      page = 1,
      limit = 20,
      category,
      state,
      schemeType,
      ministry,
      search,
    } = query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (state) {
      filter.state = state;
    }

    if (schemeType) {
      filter.schemeType = schemeType;
    }

    if (ministry) {
      filter.ministry = ministry;
    }

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

      ];

    }

    return governmentSchemeRepository.findAll(
      filter,
      {
        page: Number(page),
        limit: Number(limit),
      }
    );

  }

  // ==========================================
  // GET SCHEME BY ID
  // ==========================================
  async getById(id) {

    const scheme =
      await governmentSchemeRepository.findById(id);

    if (!scheme) {
      throw new Error("Scheme not found");
    }

    return scheme;

  }

  // ==========================================
  // UPDATE SCHEME
  // ==========================================
  async update(id, payload) {

    const scheme =
      await governmentSchemeRepository.update(
        id,
        payload
      );

    if (!scheme) {
      throw new Error("Scheme not found");
    }

    return scheme;

  }

  // ==========================================
  // DELETE SCHEME
  // ==========================================
  async delete(id) {

    const scheme =
      await governmentSchemeRepository.delete(id);

    if (!scheme) {
      throw new Error("Scheme not found");
    }

    return true;

  }

  // ==========================================
  // GET CATEGORIES
  // ==========================================
  async getCategories() {

    return governmentSchemeRepository.getCategories();

  }

  // ==========================================
  // GET STATES
  // ==========================================
  async getStates() {

    return governmentSchemeRepository.getStates();

  }

  // ==========================================
  // SEARCH
  // ==========================================
  async search(keyword) {

    return governmentSchemeRepository.search(
      keyword
    );

  }

  // ==========================================
  // BULK UPSERT
  // ==========================================
  async bulkUpsert(records) {

    if (!records.length) {
      return [];
    }

    return governmentSchemeRepository.bulkUpsert(
      records
    );

  }

  // ==========================================
  // FUTURE AUTO SYNC
  // ==========================================
  async syncSchemes() {

    /**
     * Future Flow
     *
     * OGD API
     * API Setu
     * CSV Import
     * Admin Import
     *
     */

    console.log("Government Scheme Sync Started");

    return true;

  }

}

export default new GovernmentSchemeService();