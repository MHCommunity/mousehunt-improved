const MAX_TRANSACTION_PRICE = 4_294_967_293;
const MAX_PRICE_LINKS = 6;

const roundToSignificant = (number, significantFigures = 2) => {
  if (number <= 0) {
    return 0;
  }

  const magnitude = Math.floor(Math.log10(number));
  const factor = 10 ** (magnitude - significantFigures + 1);
  return Math.round(number / factor) * factor;
};

const calculateTariff = (gross) => {
  const tax = Math.ceil(gross / 11);
  return { gross, raw: gross - tax, tax };
};

const calculateEstimatedValue = ({ owned, averagePrice }) => {
  const buy = owned * averagePrice;
  const sell = calculateTariff(averagePrice).raw * owned;
  return { buy, sell, available: averagePrice > 0 };
};

const calculateQuickSell = ({ owned, available, unitPrice }) => {
  const quantity = Math.min(owned, available);
  return { quantity, total: quantity * unitPrice, unitPrice };
};

const computePriceSteps = (best, second) => {
  const notes = new Map();
  const add = (amount, note = '') => {
    if (amount > 0 && (! notes.has(amount) || (note && ! notes.get(amount)))) {
      notes.set(amount, note);
    }
  };

  add(roundToSignificant(best * 0.01), '1%');
  add(roundToSignificant(best * 0.1), '10%');

  if (best > 100) {
    add(100);
  }

  add(10 ** Math.max(0, Math.floor(Math.log10(best)) - 1));

  if (second && second !== best) {
    const gap = Math.abs(second - best);
    if (gap <= best * 0.5) {
      add(gap);
    }
  }

  return [...notes.entries()]
    .map(([amount, note]) => ({ amount, note }))
    .sort((a, b) => a.amount - b.amount)
    .slice(0, MAX_PRICE_LINKS);
};

export {
  MAX_TRANSACTION_PRICE,
  calculateEstimatedValue,
  calculateQuickSell,
  calculateTariff,
  computePriceSteps
};
