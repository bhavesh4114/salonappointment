/**
 * Calculate finance split for a given final service price.
 *
 * finalPrice: number (e.g. total amount charged to customer)
 *
 * Logic:
 * - basePrice     = finalPrice / 1.28
 * - gstAmount     = basePrice * 0.18
 * - platformFee   = basePrice * 0.10
 * - barberEarning = basePrice
 *
 * All returned values are rounded using Math.round().
 */
export function calculateFinanceSplit(finalPrice) {
  const priceNum = Number(finalPrice) || 0;

  const basePriceRaw = priceNum / 1.28;
  const gstAmountRaw = basePriceRaw * 0.18;
  const platformFeeRaw = basePriceRaw * 0.10;

  const basePrice = Math.round(basePriceRaw);
  const gstAmount = Math.round(gstAmountRaw);
  const platformFee = Math.round(platformFeeRaw);
  const barberEarning = Math.round(basePriceRaw); // same as basePrice, but kept explicit

  return {
    basePrice,
    gstAmount,
    platformFee,
    barberEarning,
  };
}

