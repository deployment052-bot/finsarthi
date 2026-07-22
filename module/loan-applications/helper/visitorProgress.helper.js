/**
 * helpers/visitorProgress.helper.js
 * Production Ready
 */

const VERIFICATION_STEPS = [
  {
    key: "INVESTIGATION",
    title: "Investigation",
    percentage: 10,
    completed: (verification) => {
      return (
        verification.investigation &&
        (
          verification.investigation.customerAvailable ||
          verification.investigation.customerVerified ||
          verification.investigation.addressVerified ||
          verification.investigation.employmentVerified ||
          verification.investigation.businessVerified ||
          verification.investigation.incomeVerified ||
          verification.investigation.originalDocumentsVerified ||
          verification.investigation.photocopiesCollected ||
          verification.investigation.houseVisited ||
          verification.investigation.neighboursVerified
        )
      );
    },
  },

  {
    key: "PHOTOS",
    title: "Photos",
    percentage: 30,
    completed: (verification) => {
      return verification.photos?.length > 0;
    },
  },

  {
    key: "DOCUMENTS",
    title: "Documents",
    percentage: 50,
    completed: (verification) => {
      return verification.documents?.length > 0;
    },
  },

  {
    key: "WITNESS",
    title: "Witness",
    percentage: 70,
    completed: (verification) => {
      return verification.witness?.agreed === true;
    },
  },

  {
    key: "CUSTOMER_CONSENT",
    title: "Customer Consent",
    percentage: 85,
    completed: (verification) => {
      return verification.customerConsent?.accepted === true;
    },
  },

  {
    key: "DECLARATION",
    title: "Visitor Declaration",
    percentage: 95,
    completed: (verification) => {
      return verification.visitorDeclaration?.accepted === true;
    },
  },

  {
    key: "SUBMITTED",
    title: "Submitted",
    percentage: 100,
    completed: (verification) => {
      return verification.status === "SUBMITTED";
    },
  },
];

export const getVerificationProgress = (verification) => {
  const completedSteps = [];

  for (let i = 0; i < VERIFICATION_STEPS.length; i++) {
    const step = VERIFICATION_STEPS[i];

    const isCompleted = step.completed(verification);

    if (!isCompleted) {
      return {
        percentage: step.percentage,
        currentStep: step.key,
        currentStepTitle: step.title,
        nextStep:
          VERIFICATION_STEPS[i + 1]?.key || null,
        nextStepTitle:
          VERIFICATION_STEPS[i + 1]?.title || null,
        completedSteps,
        totalSteps: VERIFICATION_STEPS.length,
        completedCount: completedSteps.length,
        isCompleted: false,
      };
    }

    completedSteps.push(step.key);
  }

  return {
    percentage: 100,
    currentStep: "COMPLETED",
    currentStepTitle: "Completed",
    nextStep: null,
    nextStepTitle: null,
    completedSteps,
    totalSteps: VERIFICATION_STEPS.length,
    completedCount: completedSteps.length,
    isCompleted: true,
  };
};

/**
 * Optional helper
 * Dashboard ke liye sirf percentage chahiye ho to
 */
export const calculateProgress = (verification) => {
  return getVerificationProgress(verification).percentage;
};

/**
 * Optional helper
 * Resume feature ke liye
 */
export const getCurrentStep = (verification) => {
  return getVerificationProgress(verification).currentStep;
};