// Components are functions that returns template strings (for example: `<div></div>`)
// Name starts with big letter

import {
  store,
  type TRow,
  type TCreateMappedValueType,
  type TTypes,
} from "./store";
import { createMappedValue, getColumns } from "./data-transformers";

export interface IGroups extends TRow {
  ska1GlCodes: Record<string, boolean>;
  groupChanged: boolean;
}

export const Table = (data?: TRow[]) => {
  if (!data) return "";
  const cols = getColumns(data);
  const header = renderHeader(cols);
  const body = renderTableBody();
  return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};

export const renderFooter = () => {
  const message = store.perm?.editor
    ? `<div class="footer"><p>You are not allowed do save! User: <strong>${store.perm.editor}</strong> is editing now! Please refresh the page and try again later :)</p></div>`
    : `<div class="footer"><h2>Bro! Who are you?</h2></div>`;
  return store.perm?.canEdit
    ? `<div class="footer"><button class="btn btn--hidden" onclick="onSave(this)">Save</button></div>`
    : message;
};

export const renderPlaceholder = () =>
  `<div class="placeholder">${store.locked ? `&nbsp;&nbsp; <strong>${store.perm?.message || "LOCKED!!!"}</strong>` : ""}<div class="sync-info sync-info--hidden">Syncing changes...</div></div>`;

export interface IRenderTabs {
  id: string;
  label: string;
  content: string;
}
export const renderTabs = (topTabs: IRenderTabs[]) => {
  const renderLabels = () =>
    topTabs
      .map(
        (t, i) => `
	<input type="radio" id="tab${i}" name="tabGroup1" class="tab" ${i === 0 ? "checked" : ""} onchange="updateTab('${t.id}')">
	<label for="tab${i}">${t.label}</label> `,
      )
      .join("");

  const renderContents = () =>
    `<div class="tab__content" ${store.locked ? "inert" : ""}>${topTabs[0].content}</div>`;

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

export const renderAiLeft = () =>
  store.groupKeys
    ?.map(
      (g) => `
        <div>
        <input class="tab tab--inverted" type="radio" id="${g}" name="drone" value="${g}" ${currentOrFirstGroup() === g ? "checked" : ""}  onchange="onChangeGroup(this)" />
        <label id="${currentOrFirstGroup() === g ? "active-label" : ""}"   class="${store.groups && store.groups[g].groupChanged ? "group--changed" : ""}" for="${g}">${g}</label>
        </div>
        `,
    )
    .join("");

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
  row: TRow;
  cols: string[];
}
export const renderRow = ({ row, cols }: IRow) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const tab = store.tabs.find((t) => t.id === "h")?.columns;
  if (!tab) return "";
  const columns = cols
    .map((c) => {
      const keyColumnName = "ska1GlCode";
      const typeItem = store.types && store.types[c as keyof TTypes];
      const type = typeItem ? typeItem.type : "freetext";

      const theKey = row[keyColumnName];
      const val = row[c as keyof TRow];
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

export const ai = () => {
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

export interface IRenderForm {
  row: IGroups;
  cols: string[];
}

export const renderForm = ({ row, cols }: IRenderForm) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const ai = store.tabs.find((t) => t.id === store.activeTab)?.columns || {};
  const theKey = Object.keys(row.ska1GlCodes);
  const columns = cols
    .map((c) => {
      const { type } = store.types ? store.types[c] : { type: "checkboxList" };
      const val = row[c as keyof typeof row];
      const isDisabled = ai[c] && ai[c].changeable !== "y";

      if (
        store.changes &&
        store.changes[theKey[0]] &&
        Object.keys(store.changes[theKey[0]]).includes(c)
      ) {
        const changedVal = store.changes[theKey[0]][c];
        const isDiffer = val !== changedVal;
        return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</div>` : ""}`;
      }
      return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${renderTag({ type, theKey, val, isDisabled, c, row })}</div>` : ""}`;
    })
    .join("");

  return `<div>${columns}</div>`;
};

export interface IRenderAffectedItems {
  row: IGroups;
}
const renderAffectedItems = ({ row }: IRenderAffectedItems) => {
  const theKey = Object.keys(row.ska1GlCodes);
  const affectedItems = theKey
    .map((ska1GlCode) => `<div${getStyle(ska1GlCode)}>${ska1GlCode}</div>`)
    .join("");

  return `<div>${affectedItems}</div>`;
};

const getStyle = (ska1GlCode: string) => {
  if (!store.data) return "";
  const row = store.data.find((r) => r.ska1GlCode === ska1GlCode);
  if (!row) return "";
  const color = createMappedValue({ type: "mappedInScopeSka1GlCodes", row });
  const style = color ? ` style="color: ${color}";` : "";
  return style;
};

export const renderAiCenter = (groupId?: string) => {
  if (!store.groups || !store.groupKeys) return "";
  const row = store.groups[groupId || store.groupKeys[0]];
  const cols = Object.keys(row);
  return renderForm({ row, cols });
};

export const renderAiRight = (
  groupId = store.groupKeys && store.groupKeys[0],
) => {
  if (!store.groups) return "";
  const row = store.groups[groupId as keyof typeof store.groups];
  return renderAffectedItems({ row });
};
