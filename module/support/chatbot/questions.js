export const QUESTIONS = [
  {
    step: 0,
    field: "category",

    question: "Please select your issue category.",

    type: "OPTIONS",

    options: [
      "LOAN",
      "EMI",
      "PAYMENT",
      "TRANSACTION",
      "ACCOUNT",
      "KYC",
      "CARD",
      "APP",
      "OTHER",
    ],

    required: true,
  },

  {
    step: 1,
    field: "mobile",

    question: "Please enter your registered mobile number.",

    type: "TEXT",

    placeholder: "Enter 10 digit mobile number",

    validation: {
      type: "MOBILE",
      minLength: 10,
      maxLength: 10,
    },

    required: true,
  },

  {
    step: 2,
    field: "issueDate",

    question: "When did this issue happen?",

    type: "DATE",

    required: true,
  },

  {
    step: 3,
    field: "subject",

    question: "Please enter your issue subject.",

    type: "TEXT",

    placeholder: "Example: EMI payment failed",

    required: true,
  },

  {
    step: 4,
    field: "description",

    question: "Please describe your issue in detail.",

    type: "TEXTAREA",

    placeholder: "Explain what happened",

    required: true,
  },

  {
    step: 5,
    field: "attachments",

    question: "Upload screenshot or document (Optional).",

    type: "FILE",

    multiple: true,

    required: false,
  },
];
