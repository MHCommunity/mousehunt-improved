import { getData, sessionGet, sessionSet } from '@utils/data';
import { doRequest } from '@utils';

import { exportPopup } from './exporter';

const fetchPage = async (page) => {
  const response = await doRequest('managers/ajax/users/marketplace.php', {
    action: 'get_my_history',
    page,
  });

  return response?.marketplace_history || [];
};

const fetchTransactions = async () => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = '...';
  totalItemsEl.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });

  let page = 1;
  let response;

  let transactions = [];

  // todo: save the current page to session storage so we can resume if the user navigates away
  page = Number.parseInt(sessionGet('export-marketplace-page'), 10) || 1;

  transactions = sessionGet('export-marketplace-transactions', []);

  const tradableItems = await getData('items-tradable');

  do {
    response = await fetchPage(page);

    // loop through the transactions and add the item name to each item
    for (const item of response) {
      transactions.push({
        listing_id: item.listing_id,
        listing_type: item.listing_type,
        item_id: item.item_id,
        item_name: tradableItems.find(({ id }) => id === item.item_id)?.name || '',
        initial_quantity: item.initial_quantity,
        remaining_quantity: item.remaining_quantity,
        unit_price: item.unit_price,
        unit_price_without_tariff: item.unit_price_without_tariff,
        total_price: item.total_price,
        total_price_without_tariff: item.total_price_without_tariff,
        average: item.average,
        is_active: (item.is_active === '1'),
        date_updated: item.date_updated,
        date_closed: item.date_closed,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    page++;

    sessionSet('export-marketplace-page', page);
    sessionSet('export-marketplace-transactions', transactions);

    totalItemsEl.textContent = transactions.length.toLocaleString();
  } while (response.length > 0);

  return transactions;
};

const exportMarketplace = () => {
  exportPopup({
    type: 'marketplace-transactions',
    text: 'Marketplace Transactions',
    footerMarkup: '<div class="region-name">Total Transactions</div><div class="total-items">0</div>',
    fetch: fetchTransactions,
    download: {
      headers: [
        'Listing ID',
        'Listing Type',
        'Item ID',
        'Item Name',
        'Initial Quantity',
        'Remaining Quantity',
        'Unit Price',
        'Unit Price Without Tariff',
        'Total Price',
        'Total Price Without Tariff',
        'Average',
        'Is Active',
        'Date Updated',
        'Date Closed',
      ],
    }
  });
};

export default exportMarketplace;
