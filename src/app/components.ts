import { createMappedValue } from "./renderers";
import {
  store,
  type TData,
  type TCreateMappedValueType,
  type TTypes,
} from "./store";

export const Table = (data) => {
  const cols = getColumns(data);
  const header = renderHeader(cols);
  const body = renderTableBody();
  return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};

export const renderPlaceholder = () =>
  `<div class="placeholder">${store.locked ? `&nbsp;&nbsp; <strong>${store.perm.message || "LOCKED!!!"}</strong>` : ""}<div class="sync-info sync-info--hidden">Syncing changes...</div></div>`;

export const renderTabs = (topTabs) => {
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

export const renderHeader = (cols) => {
  const tab = window.tabs.find((t) => t.id === window.activeTab).columns;
  const columns = cols
    .map(
      (c) =>
        `${tab[c] && tab[c].visible === "y" ? ` <th title="${window.types[c].description}">${window.types[c].name}</th>` : ""}`,
    )
    .join("");
  return `<thead><tr>${columns}</tr></thead>`;
};

export const renderTableBody = () => `<tbody id="contentArea"></tbody>`;

export const renderInput = ({
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

export const renderMapped = ({
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

export const renderSelect = ({
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

export const renderDynamicOptionsSelect = ({
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

export const renderCheckbox = ({
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

export const renderDataList = ({
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

export const renderTag = (options) => {
  const { type } = options;
  if (type === "checkbox") return renderCheckbox(options);
  if (type === "freeText") return renderInput(options);
  if (type.startsWith("mapped")) return renderMapped(options);
  if (type === "inRowColumn") return renderDynamicOptionsSelect(options);
  return renderSelect(options);
};

export interface IRow {
  row: TData;
  cols: string[];
}
export export const renderRow = ({ row, cols }: IRow) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const tab = store.tabs.find((t) => t.id === "h")?.columns;
  if (!tab) return "";
  const columns = cols
    .map((c) => {
      const keyColumnName = "ska1GlCode";
      const typeItem = store.types && store.types[c as keyof TTypes];
      const type = typeItem ? typeItem.type : "freetext";

      const theKey = row[keyColumnName];
      const val = row[c as keyof TData];
      const changeable = tab[c].changeable as TCreateMappedValueType;
      let mappedValue = "";
      if (changeable.startsWith("mapped")) {
        mappedValue = createMappedValue({ type: changeable, row });
      }
      const isDisabled = mappedValue !== "y";

      if (
        store.changes &&
        store.changes[theKey] &&
        Object.keys(store.changes[theKey]).includes(c)
      ) {
        const changedVal = store.changes[theKey][c];
        const isDiffer = val !== changedVal;
        return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</td>` : ""}`;
      }
      return `${tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, c, row })}</td>` : ""}`;
    })
    .join("");
  return `<tr>${columns}</tr>`;
};

export const renderRowF = ({ r, cols }) => {
  const tab = store.tabs.find((t) => t.id === window.activeTab).columns;
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
