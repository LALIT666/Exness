-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "tradeId" BIGINT NOT NULL,
    "price" BIGINT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trades_tradeId_key" ON "trades"("tradeId");

-- CreateIndex
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");

-- CreateIndex
CREATE INDEX "trades_timestamp_idx" ON "trades"("timestamp");
