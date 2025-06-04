import "./style.css";
// import "./app/clusterize.js";
import { initApp } from "./app/init";

const params = window.location.search;
const URL = "http://localhost:3000/gl" + params;

const renderSapClient = () => {
	const sapClient = document.getElementById("sap-client");
	let output = "";
	new URLSearchParams(params).forEach((value, key) => {
		const allowedKeys = ["sapSystem", "client", "bukrs"];
		if (allowedKeys.includes(key)) {
			output =
				output +
				`<span>${key}: </span><strong>${value} </strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
		}
	});
	if (sapClient) {
		sapClient.innerHTML = output;
	}
};

const aChng = (theKey, col, val) => {
	if (!window.changes[theKey]) {
		window.changes[theKey] = { [col]: val };
	}
	window.changes[theKey][col] = val;
};

const rChng = (theKey, col) => {
	delete window.changes[theKey][col];
	if (!Object.keys(window.changes[theKey]).length) {
		delete window.changes[theKey];
	}
};

const addChange = (theKey, col, val) => {
	if (theKey.includes(",")) {
		theKey.split(",").forEach((k) => aChng(k, col, val));
	} else {
		aChng(theKey, col, val);
	}
};

const removeChange = (theKey, col) => {
	if (theKey.includes(",")) {
		theKey.split(",").forEach((k) => rChng(k, col));
	} else {
		rChng(theKey, col);
	}
};

window.updateTab = async (tabId) => {
	console.log({ tabId });
	window.activeTab = tabId;
	const tabType = window.tabs.find((t) => t.id === tabId).type;
	window.ingridients = window.lookup[`virtualKey_${tabId}`];
	if (tabType === "group") return renderAiTab();
	return await renderTableTab();
};
const renderTabs = (topTabs) => {
	const renderLabels = () =>
		topTabs
			.map(
				(t, i) => `
			<input type="radio" id="tab${i}" name="tabGroup1" class="tab" ${i === 0 ? "checked" : ""} onchange="updateTab('${t.id}')">
			<label for="tab${i}">${t.label}</label> `,
			)
			.join("");

	const renderContents = () =>
		`<div class="tab__content" ${window.locked ? "inert" : ""}>${topTabs[0].content}</div>`;

	return `
        <div class="tab-wrap">
        <div id="toptabs-labels">
        ${renderLabels()}
        </div>
        ${renderContents()}
        ${renderPlaceholder()}
        </div>
    `;
};

const renderTable = (data) => {
	const cols = getColumns(data);
	const header = renderHeader(cols);
	const body = renderTableBody();
	return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};

const getColumns = (data) => Object.keys(data[0]);

const renderHeader = (cols) => {
	const tab = window.tabs.find((t) => t.id === window.activeTab).columns;
	const columns = cols
		.map(
			(c) =>
				`${tab[c] && tab[c].visible === "y" ? ` <th title="${window.types[c].description}">${window.types[c].name}</th>` : ""}`,
		)
		.join("");
	return `<thead><tr>${columns}</tr></thead>`;
};

const renderTableBody = () => `<tbody id="contentArea"></tbody>`;

const renderInput = ({
	theKey,
	row,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";
	const v = c === "accountItem" ? createVirtualGroupKey(row) : val;
	return `<input placeholder="${v}"  ${disabled} ${diffClass} title="${v}" value="${changedVal || v}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

const renderMapped = ({
	type,
	theKey,
	row,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";
	const v = createMappedValue({ type, row });
	return `<input placeholder="${v}"  ${disabled} ${diffClass} title="${v}" value="${changedVal || v}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

const renderSelect = ({
	type,
	theKey,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";

	const options = window.lookup[type]
		.map((o) => {
			const value = changedVal || val;
			const selected = value === o ? "selected" : "";
			return `
        <option value="${o}" ${selected}>${o}</option>
        `;
		})
		.join("");

	return `<select ${disabled} ${diffClass} title="${val}" onchange="onChangeSelect(this,'${theKey}','${c}')" >
        ${options}
    </select> `;
};

const renderDynamicOptionsSelect = ({
	type,
	theKey,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
	row,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";

	const options = (row[window.lookup[type]] || [])
		.map((o) => {
			const value = changedVal || val;
			const selected = value === o ? "selected" : "";
			return `
        <option value="${o}" ${selected}>${o}</option>
        `;
		})
		.join("");

	return `<select ${disabled} ${diffClass} title="${val}" onchange="onChangeSelect(this,'${theKey}','${c}')" >
        ${options}
    </select> `;
};

const renderCheckbox = ({
	theKey,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";
	let checked = "INIT";
	if (changedVal === undefined) {
		checked = val ? "checked" : "";
	} else {
		checked = changedVal ? "checked" : "";
	}

	return `<input type='checkbox' title="${val}"  ${disabled} ${diffClass}  ${checked} onchange="onChangeCheckbox(this,'${theKey}','${c}')" />`;
};

const onOptionClick = (id, val) => {
	const input = document.getElementById(id);
	if (input.value === val) return;
	input.value = val;
	input.onchange();
};

const renderDataList = ({
	type,
	theKey,
	val,
	isDisabled,
	isDiffer,
	c,
	changedVal,
	row,
}) => {
	const disabled = isDisabled ? "disabled" : "";
	const diffClass = isDiffer ? "class='diff-values'" : "";
	const value = changedVal || val;
	const id = `${theKey}_${c}`;
	const options = (row[window.lookup[type]] || [])
		.map((o) => {
			return ` <div class="popover__item" onclick="onOptionClick('${id}','${o}')"> ${o} </div> `;
		})
		.join("");

	return `<input placeholder="${val}" id="${id}"  ${disabled} ${diffClass} title="${val}" value="${value}" onchange="onChange(this,'${theKey}','${c}')" />
            <div class="popover">
                ${options}
            </div>
        `;
};

const renderTag = (options) => {
	const { type } = options;
	if (type === "checkbox") return renderCheckbox(options);
	if (type === "freeText") return renderInput(options);
	if (type.startsWith("mapped")) return renderMapped(options);
	if (type === "inRowColumn") return renderDynamicOptionsSelect(options);
	return renderSelect(options);
};

const renderRow = ({ row, cols }) => {
	const tab = window.tabs.find((t) => t.id === window.activeTab).columns;
	const columns = cols
		.map((c) => {
			const keyColumnName = "ska1GlCode";
			const { type } = window.types[c];

			const theKey = row[keyColumnName];
			const val = row[c];
			let changeable = tab[c].changeable;
			if (changeable.startsWith("mapped")) {
				changeable = createMappedValue({ type: changeable, row });
			}
			const isDisabled = changeable !== "y";

			if (
				window.changes[theKey] &&
				Object.keys(window.changes[theKey]).includes(c)
			) {
				const changedVal = window.changes[theKey][c];
				const isDiffer = val !== changedVal;
				return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</td>` : ""}`;
			}
			return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, c, row })}</td>` : ""}`;
		})
		.join("");
	return `<tr>${columns}</tr>`;
};

const renderRowF = ({ r, cols }) => {
	const tab = window.tabs.find((t) => t.id === window.activeTab).columns;
	const row = window.groupsFiltered[r];
	const columns = cols
		.map((c) => {
			const keyColumnName = "ska1GlCode";
			const { type } =
				window.types[c] === undefined ? "freeText" : window.types[c];
			const theKey = row[keyColumnName];
			const val = row[c];

			let changeable = tab[c] === undefined ? "n" : tab[c].changeable;
			if (changeable.startsWith("mapped")) {
				changeable = createMappedValue({ type: changeable, row });
			}
			const isDisabled = changeable !== "y";

			if (
				window.changes[theKey] &&
				Object.keys(window.changes[theKey]).includes(c)
			) {
				const changedVal = window.changes[theKey][c];
				const isDiffer = val !== changedVal;
				return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</td>` : ""}`;
			}
			return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, c, row })}</td>` : ""}`;
		})
		.join("");
	return `<tr>${columns}</tr>`;
};

const isChangeAffectsGroup = (col) => window.ingridients.includes(col);

const handleInheritedChanges = ({ col, theKey }) => {
	if (!isChangeAffectsGroup(col)) return;
	if (theKey.includes(",")) return;

	const tabType = window.tabs.find((t) => t.id === window.activeTab).type;
	if (tabType !== "group") return;

	const row = window.data.filter(({ ska1GlCode }) => ska1GlCode === theKey)[0];
	const newVirtKey = createVirtualGroupKey(row);
	const groupData = window.groups[newVirtKey];
	const ai = window.tabs.find((t) => t.id === window.activeTab).columns;
	const changeableAiCols = Object.keys(ai).filter(
		(c) => ai[c].changeable === "y",
	);
	if (groupData) {
		changeableAiCols.forEach((c) => {
			if (row[c] !== groupData[c]) addChange(theKey, c, groupData[c]);
		});
	} else {
		changeableAiCols.forEach((c) => {
			removeChange(theKey, c);
		});
	}
};

async function onChange(self, theKey, col) {
	window.changes = await getData(`${URL}&d=changes`);
	const { placeholder, value, classList } = self;
	if (placeholder === value) {
		classList.remove("diff-values");
		removeChange(theKey, col);
	} else {
		classList.add("diff-values");
		addChange(theKey, col, value);
	}
	handleInheritedChanges({ col, theKey });
	updateRows(false);
}

async function onChangeSelect(self, theKey, col) {
	window.changes = await getData(`${URL}&d=changes`);
	const { title, value, classList } = self;
	if (title === value) {
		classList.remove("diff-values");
		removeChange(theKey, col);
	} else {
		classList.add("diff-values");
		addChange(theKey, col, value);
	}
	handleInheritedChanges({ col, theKey });
	updateRows(false);
}

async function onChangeCheckbox(self, theKey, col) {
	getData(`${URL}&d=changes`).then((dc) => {
		window.changes = dc;

		const { checked, classList, title } = self;
		if (title === `${checked}`) {
			classList.remove("diff-values");
			removeChange(theKey, col);
		} else {
			classList.add("diff-values");
			addChange(theKey, col, checked);
		}
		handleInheritedChanges({ col, theKey });
		updateRows(false);
	});
}

async function getData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error.message);
	}
}

async function postData(url, body) {
	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: myHeaders,
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error.message);
		return { error };
	}
}

const onSave = async (btn) => {
	let res = {};
	btn.innerText = "Saving...";
	btn.classList.add("btn--hidden");
	res = await postData(URL, window.changes);
	btn.innerText = "Data was saved ✅";
	if (res.error) {
		btn.innerText = "Data was NOT saved ❌";
		setTimeout(() => {
			btn.innerText = "Save";
			btn.classList.remove("btn--hidden");
		}, 3000);
	}
};

const updateRows = async (shouldSave = true) => {
	const searchFilter = document.getElementById(
		"filter-rows",
	) as HTMLInputElement;
	const phrase = searchFilter ? searchFilter.value.toLowerCase() : "";
	refreshGroups();
	const type = window.tabs.find((t) => t.id == window.activeTab).type;
	let cols;
	if (type === "tableF") {
		cols = Object.keys(window.groupsFiltered[window.groupKeysFiltered[0]]);
		window.rows = window.groupKeysFiltered
			.filter((r) =>
				JSON.stringify(window.groupsFiltered[r]).toLowerCase().includes(phrase),
			)
			.map((r) => renderRowF({ r, cols }));
	} else {
		cols = getColumns(window.data);
		window.rows = window.data
			.filter((r) => JSON.stringify(r).toLowerCase().includes(phrase))
			.map((row) => renderRow({ row, cols }));
	}

	window.clusterize.update(window.rows);

	refreshGroups();
	if (window.activeTab === "ai") {
		renderAiTab();
	}

	await postData(URL, window.changes);

	if (shouldSave) {
		const btn = document.querySelector("button.btn");
		btn.innerText = "Save";
		btn.classList.remove("btn--hidden");
	}
};

const onChangeGroup = (self) => updateRightContent(self.value);

const updateRightContent = (groupId) => {
	window.selectedGroup = window.groupKeys.includes(groupId)
		? groupId
		: window.groupKeys[0];

	document.querySelector(".ai-box__center > article").innerHTML =
		renderAiCenter(window.selectedGroup);
	document.querySelector(".ai-box__right > article").innerHTML = renderAiRight(
		window.selectedGroup,
	);
};

const renderTableTab = async () => {
	document.querySelector(".tab__content").innerHTML = renderTable(window.data);
	await initClusterize();
};

const renderAiTab = () => {
	document.querySelector(".tab__content").innerHTML = ai();
	window.selectedGroup = currentOrFirstGroup();
	updateRightContent(window.selectedGroup);
	const activeLabel = document.getElementById("active-label");
	activeLabel.scrollIntoView();
};

const createVirtualGroupKey = (row) => {
	const changedRecordKey = row.ska1GlCode;
	const areChanges = window.changes[changedRecordKey];
	return window.ingridients
		.map((i) => {
			const ingridientValue =
				areChanges && areChanges[i] !== undefined ? areChanges[i] : row[i];
			if (i === "oneSided") return ingridientValue ? "1S" : "2S";
			return ingridientValue;
		})
		.filter(Boolean)
		.join("_");
};

const createMappedValue = ({ type, row }) => {
	const changedRecordKey = row.ska1GlCode;
	const areChanges = window.changes[changedRecordKey];
	const { source, dict } = window.lookup[type];
	const sourceVal = source
		? areChanges && areChanges[source]
			? areChanges[source]
			: row[source]
		: "";
	const mappedVal = sourceVal !== undefined ? dict[sourceVal] : "";

	return mappedVal;
};

const createGroupedData = () => {
	const groups = {};
	window.data.forEach((row) => {
		const vKey = createVirtualGroupKey(row);
		if (!groups[vKey]) {
			groups[vKey] = { ...row };
			groups[vKey].ska1GlCodes = {};
		}
		groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
		const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
		const changedCodes = Object.keys(window.changes);
		const groupChanged =
			changedCodes.includes(row.ska1GlCode) &&
			groupCodes.includes(row.ska1GlCode);
		if (groupChanged) {
			groups[vKey].groupChanged = true;
		}
	});
	return groups;
};

const createGroupedDataFiltered = () => {
	const groups = {};
	const filteredData = window.data.filter((row) => {
		const changedValue = window.changes[row.ska1GlCode];
		if (changedValue === undefined) return row.inScope;
		const scope = changedValue.inScope;
		if (scope === undefined) return row.inScope;
		return scope;
	});
	filteredData.forEach((row) => {
		const vKey = createVirtualGroupKey(row);
		if (!groups[vKey]) {
			groups[vKey] = { ...row };
			groups[vKey].ska1GlCodes = {};
		}
		groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
		const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
		const changedCodes = Object.keys(window.changes);
		const groupChanged =
			changedCodes.includes(row.ska1GlCode) &&
			groupCodes.includes(row.ska1GlCode);
		if (groupChanged) {
			groups[vKey].groupChanged = true;
		}
	});
	return groups;
};

const renderForm = ({ row, cols }) => {
	const ai = window.tabs.find((t) => t.id === window.activeTab).columns;
	const theKey = Object.keys(row.ska1GlCodes);
	const columns = cols
		.map((c) => {
			const { type } = window.types[c] || { type: "checkboxList" };
			const val = row[c];
			const isDisabled = ai[c] && ai[c].changeable !== "y";

			if (
				window.changes[theKey[0]] &&
				Object.keys(window.changes[theKey[0]]).includes(c)
			) {
				const changedVal = window.changes[theKey[0]][c];
				const isDiffer = val !== changedVal;
				return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</div>` : ""}`;
			}
			return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDisabled, c, row })}</div>` : ""}`;
		})
		.join("");

	return `<div>${columns}</div>`;
};

const renderAffectedItems = ({ row, cols }) => {
	const theKey = Object.keys(row.ska1GlCodes);
	const color = createMappedValue({ type: "mappedInScopeSka1GlCodes", row });
	const style = color ? ` style="color: ${color}";` : "";
	const affectedItems = theKey
		.map((x) => `<div${getStyle({ gl: x })}>${x}</div>`)
		.join("");

	return `<div>${affectedItems}</div>`;
};

const getStyle = ({ gl }) => {
	const row = window.data.find((r) => r.ska1GlCode === gl);
	const color = createMappedValue({ type: "mappedInScopeSka1GlCodes", row });
	const style = color ? ` style="color: ${color}";` : "";
	return style;
};
const renderAiLeft = () =>
	window.groupKeys
		.map(
			(g, i) => `
        <div>
        <input class="tab tab--inverted" type="radio" id="${g}" name="drone" value="${g}" ${currentOrFirstGroup() === g ? "checked" : ""}  onchange="onChangeGroup(this)" />
        <label id="${currentOrFirstGroup() === g ? "active-label" : ""}"   class="${window.groups[g].groupChanged ? "group--changed" : ""}" for="${g}">${g}</label>
        </div>
        `,
		)
		.join("");

const renderAiCenter = (groupId = window.groupKeys[0]) => {
	const row = window.groups[groupId];
	const cols = Object.keys(row);
	return renderForm({ row, cols });
};

const renderAiRight = (groupId = window.groupKeys[0]) => {
	const row = window.groups[groupId];
	const cols = Object.keys(row);
	return renderAffectedItems({ row, cols });
};

const ai = () => {
	refreshGroups();
	return `
        <section class="ai-box">
        <fieldset class="ai-box__left">
            <legend>Select a group:</legend>
            ${renderAiLeft()}
        </fieldset>
        <fieldset class="ai-box__center">
            <legend>Make batch changes:</legend>
            <article>
                ${renderAiCenter()}
            </article>
        </fieldset>
        <fieldset class="ai-box__right">
            <legend>Affected items:</legend>
            <article>
                ${renderAiRight()}
            </article>
        </fieldset>
        </section>
        `;
};



const renderPlaceholder = () =>
	`<div class="placeholder">${window.locked ? `&nbsp;&nbsp; <strong>${window.perm.message || "LOCKED!!!"}</strong>` : ""}<div class="sync-info sync-info--hidden">Syncing changes...</div></div>`;

const refreshGroups = () => {
	window.groups = createGroupedData();
	window.groupKeys = Object.keys(window.groups).filter(Boolean).sort();
	window.groupsFiltered = createGroupedDataFiltered();
	window.groupKeysFiltered = Object.keys(window.groupsFiltered)
		.filter(Boolean)
		.sort();
};

const currentOrFirstGroup = () =>
	window.groupKeys.includes(window.selectedGroup)
		? window.selectedGroup
		: window.groupKeys[0];

async function initClusterize() {
	window.clusterize = await new Clusterize({
		rows: window.rows,
		scrollId: "scrollArea",
		contentId: "contentArea",
	});
	await updateRows(false);
}

window.onload = initApp;
