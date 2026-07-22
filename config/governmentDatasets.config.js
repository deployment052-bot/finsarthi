const governmentDatasets = [

  // ==========================================
  // OGD DATASET
  // ==========================================
  {
    id: "OGD_SCHEMES",

    source: "OGD",

    endpoint: "",

    method: "GET",

    enabled: true,

    mapping: {

      schemeId: "id",

      name: "name",

      shortDescription: "short_description",

      description: "description",

      category: "category",

      ministry: "ministry",

      schemeType: "scheme_type",

      state: "state",

      officialWebsite: "official_website",

      applyUrl: "apply_url",

    },

  },

  // ==========================================
  // FUTURE DATASET
  // ==========================================
  {
    id: "API_SETU",

    source: "API_SETU",

    endpoint: "",

    method: "GET",

    enabled: false,

    mapping: {

      schemeId: "id",

      name: "title",

      shortDescription: "summary",

      description: "description",

      category: "category",

      ministry: "department",

      schemeType: "type",

      state: "state",

      officialWebsite: "website",

      applyUrl: "apply_link",

    },

  },

];

export default governmentDatasets;