import axios from "axios";
import governmentSchemeRepository from "./governmentScheme.repository.js";

class GovernmentSchemeSyncService {

  // ==========================================
  // MAIN SYNC
  // ==========================================
  async sync(config) {

    try {

      console.log("=================================");
      console.log("Government Scheme Sync Started");
      console.log("=================================");

      const response = await axios.get(config.endpoint);

      const records = this.parseResponse(
        response.data,
        config.mapping
      );

      if (!records.length) {

        console.log("No Records Found");

        return {
          success: true,
          inserted: 0,
        };

      }

      await governmentSchemeRepository.bulkUpsert(
        records
      );

      console.log(`${records.length} Schemes Synced`);

      return {

        success: true,

        inserted: records.length,

      };

    } catch (error) {

      console.log(error.message);

      throw error;

    }

  }

  // ==========================================
  // RESPONSE PARSER
  // ==========================================
  parseResponse(data, mapping) {

    if (!Array.isArray(data))
      return [];

    return data.map(item => ({

      schemeId:

        item[mapping.schemeId] ||

        item.id ||

        crypto.randomUUID(),

      name:

        item[mapping.name] ||

        "",

      shortDescription:

        item[mapping.shortDescription] ||

        "",

      description:

        item[mapping.description] ||

        "",

      category:

        item[mapping.category] ||

        "",

      ministry:

        item[mapping.ministry] ||

        "",

      schemeType:

        item[mapping.schemeType] ||

        "CENTRAL",

      state:

        item[mapping.state] ||

        "ALL",

      officialWebsite:

        item[mapping.officialWebsite] ||

        "",

      applyUrl:

        item[mapping.applyUrl] ||

        "",

      source:

        mapping.source ||

        "OGD",

      lastSyncedAt:

        new Date(),

      isActive: true,

    }));

  }

}

export default new GovernmentSchemeSyncService();