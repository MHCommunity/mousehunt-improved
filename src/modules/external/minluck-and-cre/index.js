export default () => {
	const allMiceInfo = window.minlucks;

	/**
	 * Add styles to the page.
	 *
	 * @param {string} styles The styles to add.
	 */
	const addStyles = (styles) => {
		const existingStyles = document.getElementById('mh-mouseplace-custom-styles');

		if (existingStyles) {
			existingStyles.innerHTML += styles;
		} else {
			const style = document.createElement('style');
			style.id = 'mh-mouseplace-custom-styles';

			style.innerHTML = styles;
			document.head.appendChild(style);
		}
	};

	/**
	 * Get the current page slug.
	 *
	 * @return {string} The page slug.
	 */
	const getCurrentPage = () => {
		const container = document.getElementById('mousehuntContainer');
		if (! container || container.classList.length <= 0) {
			return null;
		}

		return container.classList[ 0 ].replace('Page', '').toLowerCase();
	};

	/**
	 * Do something when ajax requests are completed.
	 *
	 * @param {Function} callback    The callback to call when an ajax request is completed.
	 * @param {string}   url         The url to match. If not provided, all ajax requests will be matched.
	 * @param {boolean}  skipSuccess Skip the success check.
	 */
	const onAjaxRequest = (callback, url = false, skipSuccess = false) => {
		const req = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				if (this.responseText) {
					let response = {};
					try {
						response = JSON.parse(this.responseText);
					} catch (e) {
						return;
					}

					if (response.success || skipSuccess) {
						if (! url) {
							callback(response);
							return;
						}

						if (this.responseURL.indexOf(url) !== -1) {
							callback(response);
						}
					}
				}
			});
			req.apply(this, arguments);
		};
	};

	/**
	 * Do something when the page or tab changes.
	 *
	 * @param {Object}   callbacks
	 * @param {Function} callbacks.show   The callback to call when the overlay is shown.
	 * @param {Function} callbacks.hide   The callback to call when the overlay is hidden.
	 * @param {Function} callbacks.change The callback to call when the overlay is changed.
	 */
	const onPageChange = (callbacks) => {
		const observer = new MutationObserver(() => {
			if (callbacks.change) {
				callbacks.change();
			}
		});

		const observeTarget = document.getElementById('mousehuntContainer');
		if (observeTarget) {
			observer.observe(observeTarget, {
				attributes: true,
				attributeFilter: ['class']
			});
		}
	};

	const allType = [
		'Arcane',
		'Draconic',
		'Forgotten',
		'Hydro',
		'Parental',
		'Physical',
		'Shadow',
		'Tactical',
		'Law',
		'Rift'
	];

	const updateMinLucks = async () => {
		if ('camp' !== getCurrentPage()) {
			return;
		}

		const effectiveness = await getMiceEffectivness();

		const miceNames = Object.values(effectiveness)
			.map(({ mice }) => mice).flat()
			.map(({ name }) => name).flat();

		renderList(miceNames);
	};

	function renderList(list) {
		const minWrap = document.getElementById('minluck-list');
		if (minWrap) {
			minWrap.remove();
		}
		const mintable = document.getElementById('minluck-list-table');
		if (mintable) {
			mintable.remove();
		}

		const powerEl = document.querySelector('.campPage-trap-trapStat.power');
		const luckEl = document.querySelector('.campPage-trap-trapStat.luck');
		const powerTypeEl = document.querySelector('.campPage-trap-trapStat.power');

		if (! powerEl || ! luckEl || ! powerTypeEl) {
			return;
		}

		const luck = luckEl.innerText.match(/\d/g).join('');
		const power = powerEl.innerText.match(/\d/g).join('');
		const powerType = powerTypeEl.innerText.match(/[A-Za-z]/g).join('');

		const minluckList = document.createElement('div');
		minluckList.id = 'minluck-list';
		minluckList.className = 'campPage-trap-trapEffectiveness';

		const miceheader = document.createElement('th');
		miceheader.innerText = 'Mouse';
		miceheader.classList = 'mousename-header';

		const table = document.createElement('table');
		table.id = 'minluck-list-table';
		table.appendChild(miceheader);

		const minluckheader = document.createElement('th');
		minluckheader.innerText = 'Minluck';
		table.appendChild(minluckheader);

		const crheader = document.createElement('th');
		crheader.innerText = 'CRE';
		table.appendChild(crheader);

		const totalStats = { good: 0, bad: 0, okay: 0, total: 0 };

		for (let i = 0; i < list.length; i++) {
			const mouseNameConverted = list[ i ];
			const powerIndex = allType.indexOf(powerType);
			const micePower = allMiceInfo[ mouseNameConverted ].power;
			const miceEff = allMiceInfo[ mouseNameConverted ].effs[ powerIndex ];
			const minluckString = replaceInfinity(micePower, miceEff);
			const catchRateString = convertToCR(power, luck, micePower, miceEff);

			const row = document.createElement('tr');
			row.className = 'minlucklist-minluck-row';

			const mouseName = document.createElement('td');
			mouseName.innerText = mouseNameConverted;
			mouseName.className = 'minlucklist-minluck-name';
			row.appendChild(mouseName);

			const minLuck = document.createElement('td');
			minLuck.className = 'minlucklist-minluck-data' + (luck >= minluckString ? ' minlucklist-minluck-data-good' : '');
			minLuck.innerText = minluckString;
			row.appendChild(minLuck);

			const catchRate = document.createElement('td');
			catchRate.innerText = catchRateString;
			if (catchRateString === '100.00%') {
				totalStats.good += 1;
				catchRate.className = 'minlucklist-minluck-data minlucklist-minluck-data-good';
			} else if ((parseInt(catchRateString)) <= 60) {
				totalStats.bad += 1;
				catchRate.className = 'minlucklist-minluck-data minlucklist-minluck-data-bad';
			} else {
				catchRate.className = 'minlucklist-minluck-data';
			}
			totalStats.total += 1;
			row.appendChild(catchRate);

			table.appendChild(row);
		}

		minluckList.appendChild(table);

		const statsContainer = document.querySelector('.campPage-trap-statsContainer');
		if (statsContainer) {
			statsContainer.appendChild(minluckList);
		}

		const trap = document.getElementsByClassName('trapImageView-layerWrapper')[ 0 ];

		trap.classList.remove('minluck-indicator-all-good');
		trap.classList.remove('minluck-indicator-bad');
		trap.classList.remove('minluck-indicator-good');
		trap.classList.remove('minluck-indicator-none');

		if (totalStats.good === totalStats.total) {
			trap.classList.add('minluck-indicator-all-good');
		} else if (totalStats.bad === totalStats.total) {
			trap.classList.add('minluck-indicator-bad');
		} else if (totalStats.good > totalStats.total / 2) {
			trap.classList.add('minluck-indicator-good');
		} else {
			trap.classList.add('minluck-indicator-none');
		}

		const rowData = table.getElementsByTagName('tr');

		for (let i = 0; i < rowData.length - 1; i++) {
			for (let j = 0; j < rowData.length - (i + 1); j++) {
				if (Number(rowData.item(j).getElementsByTagName('td').item(1).innerHTML.replace(/[^0-9.]+/g, '')) < Number(rowData.item(j + 1).getElementsByTagName('td').item(1).innerHTML.replace(/[^0-9.]+/g, ''))) {
					table.insertBefore(rowData.item(j + 1), rowData.item(j));
				}
			}
		}
	}

	const getUserHash = () => {
		// eslint-disable-next-line no-undef
		if (typeof unsafeWindow !== 'undefined' && unsafeWindow.user.unique_hash) {
			// eslint-disable-next-line no-undef
			return unsafeWindow.user.unique_hash;
		}

		// if window.user exists, return the hash
		if (window.user && window.user.unique_hash) {
			return window.user.unique_hash;
		}
	};

	const getMiceEffectivness = async () => {
		const url = 'https://www.mousehuntgame.com/managers/ajax/users/getmiceeffectiveness.php';
		const formData = 'sn=Hitgrab&hg_is_ajax=1&uh=' + getUserHash();

		// post the data to the url
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: formData,
		});

		const responseText = await response.text();
		const data = JSON.parse(responseText);

		if (! data.effectiveness) {
			return;
		}

		return data.effectiveness;
	};

	function replaceInfinity(mousePower, eff) {
		// Can't evalute infinity symbol, so was replaced with 9999 as minluck instead
		const infinitySym = String.fromCharCode(0x221E);
		eff = eff / 100;

		if (eff === 0) {
			return infinitySym;
		}

		const minluck = Math.ceil(Math.ceil(Math.sqrt(mousePower / 2)) / Math.min(eff, 1.4));
		if (minluck >= 9999) {
			return infinitySym;
		}

		if (2 * Math.pow(Math.floor(Math.min(1.4, eff) * minluck), 2) >= mousePower) {
			return minluck;
		}

		return minluck + 1;
	}

	function convertToCR(power, luck, mPower, mEff) {
		mEff = mEff / 100;
		// eslint-disable-next-line no-mixed-operators
		let result = Math.min(1, (power * mEff + 2 * Math.pow(Math.floor(luck * Math.min(mEff, 1.4)), 2)) / (mPower + power * mEff));
		result = (result * 100).toFixed(2) + '%';
		return result;
	}

	const makeMinLuckButton = () => {
		const button = document.getElementById('minluck-button');
		if (! button) {
			const minluckButton = document.createElement('a');
			minluckButton.id = 'minluck-button';
			minluckButton.classList.add('campPage-trap-trapEffectiveness');
			minluckButton.textContent = '🐭️ Minluck & Catch Rate Estimate';

			const statsContainer = document.querySelector('.campPage-trap-statsContainer');
			if (statsContainer) {
				statsContainer.appendChild(minluckButton);
			}
		}
	};

	addStyles(`
	#minluck-button {
		margin-top: 10px;
	}

	#minluck-list {
		padding: 10px;
		margin-bottom: 10px;
		margin-top: -2px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	#minluck-list table {
		margin: 0 10px 10px 10px;
		width: 100%;
	}

	#minluck-list table th {
		text-align: center;
		font-weight: bold;
	}

	#minluck-list table th.mousename-header {
		text-align: left;
	}

	#minluck-list table:first-child {
		text-align: left;
	}

	.minlucklist-minluck-name {
		min-width: 85px;
		white-space: nowrap;
		overflow: hidden;
		max-width: 150px;
		text-overflow: ellipsis;
	}

	.minlucklist-minluck-data {
		text-align: center;
		min-width: 70px;
	}

	.minlucklist-minluck-data-good {
		color: #138f13;
	}

	.minlucklist-minluck-data-bad {
		color: #bb4646;
	}

	.minluck-indicator-all-good {
		border-top: 5px solid blue;
	}

	.minluck-indicator-good {
		border-top: 5px solid #2f82ec;
	}

	.minluck-indicator-bad {
		border-top: 5px solid #990000;
	}

	.minluck-indicator-all-good,
	.minluck-indicator-good,
	.minluck-indicator-bad {
		border-top: none;
	}`);

	onAjaxRequest(updateMinLucks, '/managers/ajax/users/changetrap.php');
	onPageChange({ change: updateMinLucks });

	makeMinLuckButton();
	updateMinLucks();

	setTimeout(() => {
		makeMinLuckButton();
		updateMinLucks();
	}, 750);
};
