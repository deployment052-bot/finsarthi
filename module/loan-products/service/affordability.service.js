export const getAvailableEMICapacity =
(
  income,
  existingEMI = 0
) => {

  const maxEMI =
    income * 0.4;

  return Math.max(
    maxEMI - existingEMI,
    0
  );
};