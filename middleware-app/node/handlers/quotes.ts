// export async function getQuotes(ctx: Context, next: () => Promise<any>) {
//   const {
//     clients: { CustomMasterData },
//   } = ctx;

//   try {
//     console.log("Fetching quotes from MasterData");
//     const quotes = await CustomMasterData.getQuotes();
//     console.log(
//       "Quotes fetched successfully:",
//       JSON.stringify(quotes).substring(0, 100) + "..."
//     );
//     ctx.body = quotes;
//     ctx.status = 200;
//   } catch (error) {
//     console.error("Error fetching quotes:", error);
//     ctx.body = {
//       error: (error as Error).message || "Unknown error occurred",
//       stack: (error as Error).stack,
//     };
//   }

//   await next();
// }
