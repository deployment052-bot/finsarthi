export const getBureauCreditData =
async(user)=>{

  const bureauResponse =
  await bureauApiCall();

  return {
     score:
       bureauResponse.score,

     activeLoans:
       bureauResponse.activeLoans,

     overdueAmount:
       bureauResponse.overdueAmount,

     enquiries:
       bureauResponse.enquiries,

     source:"CIBIL"
  };
};