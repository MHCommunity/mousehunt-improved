import { doRequest, isAppleOS } from '@utils';
import { exportPopup } from '../utils';

let crowns = 0;
/**
 * Fetch the favorite setups.
 *
 * @return {Array} The favorite setups.
 */
const fetch = async () => {
  const crownsData = await doRequest('managers/ajax/pages/page.php', {
    page_class: 'HunterProfile',
    'page_arguments[legacyMode]': '',
    'page_arguments[tab]': 'kings_crowns',
    'page_arguments[sub_tab]': false,
    'page_arguments[snuid]': user.sn_user_id,
  });

  const badgeGroups = crownsData?.page?.tabs?.kings_crowns?.subtabs?.[0]?.mouse_crowns?.badge_groups;

  if (! badgeGroups) {
    return [];
  }

  // Map each group to the requested format
  const result = [];
  for (const group of badgeGroups) {
    crowns += group.count;
    result.push(`${group.name} Crown (${group.count})`, `Earned at ${group.catches} catches`);

    group.mice
      .map((mouse) => ({
        name: mouse.name,
        catches: mouse.num_catches,
      }))
      .sort((a, b) => b.catches - a.catches)
      .forEach((mouse) => {
        result.push(mouse.catches.toString(), mouse.name);
      });
  }

  result.push(''); // Add an empty line at the end for better readability
  return result;
};

const afterFetch = () => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  if (! totalItemsEl) {
    return;
  }

  totalItemsEl.textContent = crowns.toLocaleString();
};

/**
 * Export the favorite setups.
 */
const exportKingsCrowns = () => {
  exportPopup({
    type: 'kings-crowns',
    text: 'Mouse Stats by Crowns',
    fetch,
    afterFetch,
    footerMarkup: '<div class="region-name">Total Crowns</div><div class="total-items">-</div>',
    copyInsteadOfDownload: true,
    extraText: `<p>This data is formatted for use in the <a href="https://docs.google.com/spreadsheets/d/16s24Y4UdkCMt1JBHvVrI6a8N3gbVF6uSkz8SJJ88SP4/edit?gid=577298820#gid=577298820" target="_blank">MouseHunt Crown Tracker</a> spreadsheet.
    <p>You can also hit <code>${isAppleOS ? 'CMD' : 'Ctrl'} + C</code> on the King's Crowns page to copy the data to your clipboard in the same format.</p>`,
  });
};

export default exportKingsCrowns;
