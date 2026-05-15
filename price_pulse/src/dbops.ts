import prisma from "./db";

export async function saveTradeBatch(tradeBatch: any) {
  try {
    if (!tradeBatch.length) return;

    const result = await prisma.trade.createMany({
      data: tradeBatch,
      skipDuplicates: true,
    });

    console.log(` Inserted ${result.count} trades`);
  } catch (error) {
    console.error("Error saving trade batch:", error);
  }
}
