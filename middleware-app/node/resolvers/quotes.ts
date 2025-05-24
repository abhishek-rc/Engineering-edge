export const GetQuotes = async (_: any, args: any, ctx: Context) => {
  const {
    clients: { CustomMasterData },
  } = ctx;

  console.log("Query variables:", args);

  try {
    // Pass the account parameter to the getQuotes method
    const data = await CustomMasterData.getAssigneeQuotes(args.account);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch quotes: ${error}`);
  }
};

export const GetQuoteById = async (_: any, args: any, ctx: Context) => {
  const {
    clients: { CustomMasterData },
  } = ctx;

  console.log("Query variables for GetQuoteById:", args);

  try {
    // Pass the quoteId parameter to the getQuotesById method
    const data = await CustomMasterData.getQuotesById(args.quoteId);

    console.log("Data for GetQuoteById:", data);

    // Return the first item from the array if it exists
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    throw new Error(`Failed to fetch quote by ID: ${error}`);
  }
};

export const UpdateAssignee = async (
  _: any,
  {
    assignedTo,
    assigneeId,
    documentId,
  }: { assignedTo: string; assigneeId: string; documentId: string },
  ctx: Context
) => {
  const {
    clients: { CustomMasterData },
  } = ctx;

  try {
    await CustomMasterData.updatePartialDocument({
      dataEntity: "quotes",
      id: documentId,
      fields: {
        assignedTo: assignedTo, //SELLER or CUSTOMER or OPERATOR
        assigneeId: assigneeId, //SELLERACCOUNTID or CUSTOMERACCOUNTID or OPERATORACCOUNTID
      },
      schema: "v1.3",
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to update assignee: ${error}`);
  }
};
