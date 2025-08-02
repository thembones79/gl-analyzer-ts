// Components are functions that returns template strings (for example: `<div></div>`)
// Name starts with big letter

import {
  store,
  type TRow,
  type TCreateMappedValueType,
  type TTypes,
  type TFilter,
} from "./store";
import {
  createMappedValue,
  currentOrFirstGroup,
  createVirtualGroupKey,
  getColumns,
  refreshGroups,
} from "./data-transformers";

export interface IGroups extends TRow {
  ska1GlCodes: Record<string, boolean>;
  groupChanged: boolean;
}

export interface IRenderField {
  type: TFilter | TCreateMappedValueType;
  theKey: string;
  row: TRow;
  val: string | boolean | string[] | Record<string, boolean>;
  isDisabled?: boolean;
  isDiffer?: boolean;
  c: string;
  changedVal?: string;
}

export interface IRenderTabs {
  id: string;
  label: string;
  content: string;
}

export interface IRow {
  row: TRow;
  cols: string[];
}

export interface IRowF {
  rowStr: string;
  cols: string[];
}

export interface IRenderForm {
  row: IGroups;
  cols: string[];
}

export interface IRenderAffectedItems {
  row: IGroups;
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

export const renderHeader = (cols: string[]) => {
  if (!store.types) return "";
  const tab = store.tabs?.find((t) => t.id === store.activeTab)?.columns;
  const columns = cols
    .map(
      (c) =>
        `${tab && tab[c] && tab[c].visible === "y" ? ` <th title="${store.types ? store.types[c].description : ""}">${store.types ? store.types[c].name : ""}</th>` : ""}`,
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
}: IRenderField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  const v = c === "accountItem" ? createVirtualGroupKey(row) : val;
  return `<input placeholder="${v}"  ${disabled} ${diffClass} title="${v}" value="${changedVal || v}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

export const renderMapped = ({
  type,
  theKey,
  row,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}: IRenderField) => {
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
}: IRenderField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";

  const options = (
    store.lookup && Array.isArray(store.lookup[type])
      ? store.lookup[type].map((o) => {
          const value = changedVal || val;
          const selected = value === o ? "selected" : "";
          return `
        <option value="${o}" ${selected}>${o}</option>
        `;
        })
      : []
  ).join("");

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
}: IRenderField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";

  if (!store.lookup) return "";
  const inRowColumn = store.lookup[type];

  const options = (row[inRowColumn] || [])
    .map((o: string) => {
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
}: IRenderField) => {
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
}: IRenderField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  const value = changedVal || val;
  const id = `${theKey}_${c}`;
  const options = (row[store.lookup[type]] || [])
    .map((o: string) => {
      return ` <div class="popover__item" onclick="onOptionClick('${id}','${o}')"> ${o} </div> `;
    })
    .join("");

  return `<input placeholder="${val}" id="${id}"  ${disabled} ${diffClass} title="${val}" value="${value}" onchange="onChange(this,'${theKey}','${c}')" />
            <div class="popover">
                ${options}
            </div>
        `;
};

export const renderTag = (options: IRenderField) => {
  const { type } = options;
  if (type === "checkbox") return renderCheckbox(options);
  if (type === "freeText") return renderInput(options);
  if (type.startsWith("mapped")) return renderMapped(options);
  if (type === "inRowColumn") return renderDynamicOptionsSelect(options);
  return renderSelect(options);
};

export const renderRow = ({ row, cols }: IRow) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const tab = store.tabs.find((t) => t.id === store.activeTab)?.columns;
  if (!tab) return "";
  const columns = cols
    .map((c) => {
      const keyColumnName = "ska1GlCode";
      const typeItem = store.types && store.types[c as keyof TTypes];
      const type = typeItem ? typeItem.type : "freeText";

      const theKey = row[keyColumnName];
      const val = row[c as keyof TRow];
      const changeable = tab[c].changeable as TCreateMappedValueType;
      let mappedValue = changeable;
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

export const renderRowF = ({ rowStr, cols }: IRowF) => {
  if (!store.changes || !store.types || !store.tabs) return "";

  const tab = store.tabs?.find((t) => t.id === store.activeTab)?.columns;
  const rowInScope = store.groupsFiltered && store.groupsFiltered[rowStr];
  const columns = cols
    .map((c) => {
      const keyColumnName = "ska1GlCode";
      const { type } =
        store.types && store.types[c] !== undefined
          ? store.types[c]
          : { type: "freeText" };
      const theKey = rowInScope && rowInScope[keyColumnName];
      const val = rowInScope && rowInScope[c as keyof typeof rowInScope];

      let changeable = tab && tab[c] !== undefined ? tab[c].changeable : "n";
      if (changeable.startsWith("mapped")) {
        //@ts-ignore
        changeable = createMappedValue({ type: changeable, row: rowInScope });
      }
      const isDisabled = changeable !== "y";

      if (
        store.changes &&
        theKey &&
        tab &&
        store.changes[theKey] &&
        Object.keys(store.changes[theKey]).includes(c)
      ) {
        const changedVal = store.changes[theKey][c];
        const isDiffer = val !== changedVal;
        //@ts-ignore
        return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row: rowInScope })}</td>` : ""}`;
      }
      //@ts-ignore
      return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${renderTag({ type, theKey, val, isDisabled, c, row: rowInScope })}</td>` : ""}`;
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

export const renderForm = ({ row, cols }: IRenderForm) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const ai = store.tabs.find((t) => t.id === store.activeTab)?.columns || {};
  const theKey = Object.keys(row.ska1GlCodes).join(",");
  const columns = cols
    .map((c) => {
      const record = store.types ? store.types[c] : { type: "freeText" };
      const type = ( record ? record.type : "freeText") as TFilter;
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
