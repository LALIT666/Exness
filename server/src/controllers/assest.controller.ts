import type { Response, Request } from "express";

import { PRICESTORE } from "../store/price.store";

export function getAssest(req: Request, res: Response) {
  try {
    const availableAssets = [
      {
        displayName: "Bitcoin",
        shortSymbol: "BTC",
        decimalPlaces: 4,
        imageUrl: "/images/btc.png",
      },
      {
        displayName: "Ethereum",
        shortSymbol: "ETH",
        decimalPlaces: 4,
        imageUrl: "/images/eth.png",
      },
      {
        displayName: "Solana",
        shortSymbol: "SOL",
        decimalPlaces: 4,
        imageUrl: "/images/sol.png",
      },
    ];

    const formattedAssetResponse = availableAssets.map((singleAsset) => {
      const currentPriceFromPriseStoreInMemory =
        PRICESTORE[singleAsset.shortSymbol];

      if (!currentPriceFromPriseStoreInMemory) {
        return {
          name: singleAsset.displayName,
          symbol: singleAsset.shortSymbol,
          buyPrice: 0,
          sellPrice: 0,
          decimals: singleAsset.decimalPlaces,
          imageUrl: singleAsset.imageUrl,
        };
      }

      return {
        name: singleAsset.displayName,
        symbol: singleAsset.shortSymbol,
        buyPrice: currentPriceFromPriseStoreInMemory.ask,
        sellPrice: currentPriceFromPriseStoreInMemory.bid,
        decimals: singleAsset.decimalPlaces,
        imageUrl: singleAsset.imageUrl,
      };
    });

    return res.status(200).json({
      success: true,
      assets: formattedAssetResponse,
    });
  } catch (error) {
    console.error("Error while fetching asset list:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
