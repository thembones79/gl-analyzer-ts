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

export interface IField {
  type: TFilter | TCreateMappedValueType;
  theKey: string | string[];
  row: TRow;
  val: string | boolean | string[] | Record<string, boolean>;
  isDisabled?: boolean;
  isDiffer?: boolean;
  c: string;
  changedVal?: string;
}

export interface ITabs {
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

export interface IForm {
  row: IGroups;
  cols: string[];
}

export interface IAffectedItems {
  row: IGroups;
}

export const Table = (data?: TRow[]) => {
  if (!data) return "";
  const cols = getColumns(data);
  const header = Header(cols);
  const body = TableBody();
  return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};

export const Footer = () => {
  const message = store.perm?.editor
    ? `<div class="footer"><p>You are not allowed do save! User: <strong>${store.perm.editor}</strong> is editing now! Please refresh the page and try again later :)</p></div>`
    : `<div class="footer"><h2>Bro! Who are you?</h2></div>`;
  return store.perm?.canEdit
    ? `<div class="footer"><button class="btn btn--hidden" onclick="onSave(this)">Save</button></div>`
    : message;
};

export const Placeholder = () =>
  `<div class="placeholder">${store.locked ? `<strong>${store.perm?.message || "LOCKED!!!"}</strong>` : store.error || ""}<div class="sync-info sync-info--hidden">Syncing changes...</div></div>`;

export const Tabs = (topTabs: ITabs[]) => {
  const Labels = () =>
    topTabs
      .map(
        (t, i) => `
	<input type="radio" id="tab${i}" name="tabGroup1" class="tab" ${i === 0 ? "checked" : ""} onchange="updateTab('${t.id}')">
	<label for="tab${i}">${t.label}</label> `,
      )
      .join("");

  const Contents = () =>
    `<div class="tab__content" >${topTabs && topTabs[0] ? topTabs[0].content : ""}</div>`;

  return `
        <div class="tab-wrap">
        <div id="toptabs-labels">
        ${Labels()}
        </div>
        ${Contents()}
        ${Placeholder()}
        </div>
    `;
};

export const AiLeft = () =>
  store.groupKeys
    ?.map(
      (g) => `
        <div>
        <input class="tab tab--inverted" type="radio" id="${g}" name="drone" value="${g}" ${currentOrFirstGroup() === g ? "checked" : ""}  onchange="onChangeGroup(this)" />
        <label id="${currentOrFirstGroup() === g ? "active-label" : ""}"   class="${store.groups && store.groups[g].groupChanged ? "group--changed" : ""}" for="${g}">${g}</label>
        </div>
        `,
    )
    .join("") || "";

export const Header = (cols: string[]) => {
  if (!store.types) return "";
  const types = store.types;
  const tab = store.tabs?.find((t) => t.id === store.activeTab)?.columns;
  if (!tab) return "";
  store.csv = [];
  const header = Object.values(cols)
    .filter((col) => tab[col]?.visible === "y")
    .map((col) => types[col]?.name ?? "");
  store.csv.push(header);

  const columns = cols
    .map(
      (c) =>
        `${tab && tab[c] && tab[c].visible === "y" ? ` <th title="${store.types ? store.types[c].description : ""}"><input oninput="onChangeFilters(this)" type="search" id="id_${c}" /><div>${store.types ? store.types[c].name : ""}</div></th>` : ""}`,
    )
    .join("");
  return `<thead><tr>${columns}</tr></thead>`;
};

export const TableBody = () =>
  `<tbody id="contentArea" ${store.locked || store.error ? "inert" : ""}></tbody>`;

export const Input = ({
  theKey,
  row,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}: IField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  const v = (c === "accountItem" || c === "accountItemClearing" || c === "accountItemClearing_RevC") ? createVirtualGroupKey(row) : val;
  return `<input placeholder="${v}"  ${disabled} ${diffClass} title="${v}" value="${changedVal || v}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

export const MappedInput = ({
  type,
  theKey,
  row,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}: IField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";
  const v = createMappedValue({ type, row });
  return `<input placeholder="${v}"  ${disabled} ${diffClass} title="${v}" value="${changedVal || v}" onchange="onChange(this,'${theKey}','${c}')" />`;
};

export const Select = ({
  type,
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}: IField) => {
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

export const DynamicOptionsSelect = ({
  type,
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
  row,
}: IField) => {
  const disabled = isDisabled ? "disabled" : "";
  const diffClass = isDiffer ? "class='diff-values'" : "";

  if (!store.lookup) return "";
  const inRowColumn = store.lookup[type];


 //@ts-ignore 
const source = Array.isArray(inRowColumn)? row[inRowColumn[0]]: [];

  //@ts-ignore
  const options = (Array.isArray(source) ? source : [])
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

export const Checkbox = ({
  theKey,
  val,
  isDisabled,
  isDiffer,
  c,
  changedVal,
}: IField) => {
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

export const Field = (options: IField) => {
  const { type } = options;
  if (type === "checkbox") return Checkbox(options);
  if (type === "freeText") return Input(options);
  if (type.startsWith("mapped")) return MappedInput(options);
  if (type === "inRowColumn") return DynamicOptionsSelect(options);
  return Select(options);
};

export const Row = ({ row, cols }: IRow) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const isDebug = window.location.search.includes("debug=true");
  if(isDebug) console.log("Active Tab: " + store.activeTab);
  const tab = store.tabs.find((t) => t.id === store.activeTab)?.columns;
  const colm: string[] = [];
  if (!tab) return "";
  const columns = cols
    .map((c) => {
      //if(isDebug) console.log(c + ";" + tab[c]);
      const keyColumnName = "ska1GlCode";
      const typeItem = store.types && store.types[c as keyof TTypes];
      const type = typeItem ? typeItem.type : "freeText";

      const theKey = row[keyColumnName];
      const val = row[c as keyof TRow];
      const changeable = (tab[c] ? tab[c].changeable : "n") as TCreateMappedValueType ;
      let mappedValue = changeable as string;
      if (changeable.startsWith("mapped")) {
        mappedValue = createMappedValue({ type: changeable, row }) as string;
      }
      const isDisabled = mappedValue !== "y";

      if (
        store.changes &&
        store.changes[theKey] &&
        Object.keys(store.changes[theKey]).includes(c)
      ) {
        const changedVal = store.changes[theKey][c];
        const isDiffer = val !== changedVal;
        if (tab[c] !== undefined) {
          if (tab[c].visible === "y") {
            const v =
              c === "accountItem" ||
              c === "accountItemClearing" ||
              c === "accountItemClearing_RevC"
                ? createVirtualGroupKey(row)
                : changedVal;
            colm.push(v);
          }
        }
        return `${tab[c].visible === "y" ? `<td>${Field({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</td>` : ""}`;
      }
      if (tab[c] !== undefined) {
        if (tab[c].visible === "y") {
          const v =
            c === "accountItem" ||
            c === "accountItemClearing" ||
            c === "accountItemClearing_RevC"
              ? createVirtualGroupKey(row)
              : val;
          colm.push(String(v));
        }
      }
      return `${tab[c].visible === "y" ? `<td>${Field({ type, theKey, val, isDisabled, c, row })}</td>` : ""}`;
    })
    .join("");
  store?.csv?.push(colm);
  return `<tr>${columns}</tr>`;
};

export const RowF = ({ rowStr, cols }: IRowF) => {
  if (!store.changes || !store.types || !store.tabs) return "";
  const tab = store.tabs?.find((t) => t.id === store.activeTab)?.columns;
  const row = store.groupsFiltered?.[rowStr];
  if (!row) return "";
  const colm: string[] = [];
  const rowInScope = store.groupsFiltered && store.groupsFiltered[rowStr];
  if (!tab) return "";
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
        if (tab[c] !== undefined) {
          if (tab[c].visible === "y") {
            const v =
              c === "accountItem" ||
              c === "accountItemClearing" ||
              c === "accountItemClearing_RevC"
                ? createVirtualGroupKey(row)
                : changedVal;
            colm.push(v);
          }
        }
        //@ts-ignore
        return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${Field({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row: rowInScope })}</td>` : ""}`;
      }
      if (tab[c] !== undefined) {
        if (tab[c].visible === "y") {
          const v =
            c === "accountItem" ||
            c === "accountItemClearing" ||
            c === "accountItemClearing_RevC"
              ? createVirtualGroupKey(row)
              : val;
          colm.push(String(v));
        }
      }
      //@ts-ignore
      return `${tab[c] === undefined ? "" : tab[c].visible === "y" ? `<td>${Field({ type, theKey, val, isDisabled, c, row: rowInScope })}</td>` : ""}`;
    })
    .join("");
  store?.csv?.push(colm);
  return `<tr>${columns}</tr>`;
};

export const Ai = () => {
  refreshGroups();
  return `
        <section class="ai-box">
        <fieldset class="ai-box__left">
            <legend>Select a group:</legend>
            ${AiLeft()}
        </fieldset>
        <fieldset class="ai-box__center" ${store.locked || store.error ? "inert" : ""}>
            <legend>Make batch changes:</legend>
            <article>
                ${AiCenter()}
            </article>
        </fieldset>
        <fieldset class="ai-box__right">
            <legend>Affected items:</legend>
            <article>
                ${AiRight()}
            </article>
        </fieldset>
        </section>
        `;
};

export const Form = ({ row, cols }: IForm) => {
  if (!store.tabs || !store.activeTab || !store.types) return "";
  const ai = store.tabs.find((t) => t.id === store.activeTab)?.columns || {};
  const theKey = Object.keys(row.ska1GlCodes);
  const columns = cols
    .map((c) => {
      const record = store.types ? store.types[c] : { type: "freeText" };
      const type = (record ? record.type : "freeText") as TFilter;
      const val = row[c as keyof typeof row];
      const isDisabled = ai[c] && ai[c].changeable !== "y";

      if (
        store.changes &&
        store.changes[theKey[0]] &&
        Object.keys(store.changes[theKey[0]]).includes(c)
      ) {
        const changedVal = store.changes[theKey[0]][c];
        const isDiffer = val !== changedVal;
        return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${Field({ type, theKey, val, isDisabled, isDiffer, c, changedVal, row })}</div>` : ""}`;
      }
      return `${ai[c] && ai[c].visible === "y" ? `<div class="form-item"><label>${c}</label>${Field({ type, theKey, val, isDisabled, c, row })}</div>` : ""}`;
    })
    .join("");

  return `<div>${columns}</div>`;
};

const AffectedItems = ({ row }: IAffectedItems) => {
  const theKey = row ? Object.keys(row.ska1GlCodes) : [];
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

export const AiCenter = (groupId = store.groupKeys && store.groupKeys[0]) => {
  if (!store.groups || !store.groupKeys) return "";
  const row = store.groups[groupId || store.groupKeys[0]];
  if (!row) return "";
  const cols = Object.keys(row);
  return Form({ row, cols });
};

export const AiRight = (groupId = store.groupKeys && store.groupKeys[0]) => {
  if (!store.groups) return "";
  const row = store.groups[groupId as keyof typeof store.groups];
  return AffectedItems({ row });
};
