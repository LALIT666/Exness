-- CreateTable
CREATE TABLE "Candle" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "open" INTEGER NOT NULL,
    "high" INTEGER NOT NULL,
    "low" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,

    CONSTRAINT "Candle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candle_symbol_idx" ON "Candle"("symbol");

-- CreateIndex
CREATE INDEX "Candle_interval_idx" ON "Candle"("interval");

-- CreateIndex
CREATE INDEX "Candle_bucket_idx" ON "Candle"("bucket");
