import {
  store,
  type TData,
  type TGroups,
  type ICreateMappedValue,
} from "./store";
import { postData, params, URL } from "./api";

import { renderRow, renderRowF } from "./components";

const aChng = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (!store.changes) return;
  if (!store.changes[theKey]) {
    store.changes[theKey] = { [col]: val };
  }
  store.changes[theKey][col] = val;
};

const rChng = (theKey: string, col: string) => {
  if (!store.changes) return;
  delete store.changes[theKey][col];
  if (!Object.keys(store.changes[theKey]).length) {
    delete store.changes[theKey];
  }
};

export const addChange = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => aChng(k, col, val));
  } else {
    aChng(theKey, col, val);
  }
};

export const removeChange = (theKey: string, col: string) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => rChng(k, col));
  } else {
    rChng(theKey, col);
  }
};

export const getColumns = (data: TData[]) => Object.keys(data[0]);

export const reRenderFooter = () => {
  const footer = document.querySelector(".footer");
  if (!footer) return;
  footer.outerHTML = renderFooter();
};

export const renderFooter = () => {
  const message = store.perm?.editor
    ? `<div class="footer"><p>You are not allowed do save! User: <strong>${store.perm.editor}</strong> is editing now! Please refresh the page and try again later :)</p></div>`
    : `<div class="footer"><h2>Bro! Who are you?</h2></div>`;
  return store.perm?.canEdit
    ? `<div class="footer"><button class="btn btn--hidden" onclick="onSave(this)">Save</button></div>`
    : message;
};

export const createVirtualGroupKey = (row: TData) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  return store.ingridients
    ? store.ingridients
        .map((i) => {
          const ingridientValue =
            areChanges && areChanges[i] !== undefined
              ? areChanges[i]
              : row[i as keyof typeof row];
          if (i === "oneSided") return ingridientValue ? "1S" : "2S";
          return ingridientValue;
        })
        .filter(Boolean)
        .join("_")
    : "";
};

export const createMappedValue = ({ type, row }: ICreateMappedValue) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  if (!store.lookup) return "";
  const { source, dict } = store.lookup[type];
  const sourceVal = source
    ? areChanges && areChanges[source]
      ? areChanges[source]
      : row[source as keyof typeof row]
    : "";
  const mappedVal =
    sourceVal !== undefined ? dict[sourceVal as keyof typeof dict] : "";

  return mappedVal;
};

export const createGroupedData = () => {
  const groups: TGroups = {};
  store?.data?.forEach((row) => {
    const vKey = createVirtualGroupKey(row) as keyof typeof groups;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = store.changes ? Object.keys(store.changes) : [];
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (!groups[vKey]) {
      const ska1GlCodes = {};
      groups[vKey] = { ...row, ska1GlCodes, groupChanged };
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
  });
  return groups;
};

const createGroupedDataFiltered = () => {
  const groups: TGroups = {};
  const filteredData = store.data
    ? store.data?.filter((row) => {
        const changedValue = store.changes && store.changes[row.ska1GlCode];
        if (changedValue === undefined) return row.inScope;
        const scope = changedValue.inScope;
        if (scope === undefined) return row.inScope;
        return scope;
      })
    : [];

  filteredData.forEach((row) => {
    const vKey = createVirtualGroupKey(row) as keyof typeof groups;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = store.changes ? Object.keys(store.changes) : [];
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (!groups[vKey]) {
      const ska1GlCodes = {};
      groups[vKey] = { ...row, ska1GlCodes, groupChanged };
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
  });
  return groups;
};

export const refreshGroups = () => {
  store.groups = createGroupedData();
  store.groupKeys = Object.keys(store.groups).filter(Boolean).sort();
  store.groupsFiltered = createGroupedDataFiltered();
  store.groupKeysFiltered = Object.keys(store.groupsFiltered)
    .filter(Boolean)
    .sort();
};

export const currentOrFirstGroup = () => {
  if (!store.groupKeys) return "";
  if (!store.selectedGroup) return store.groupKeys[0];
  if (store.groupKeys.includes(store.selectedGroup)) return store.selectedGroup;
  return store.groupKeys[0];
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

const isChangeAffectsGroup = (col: string) => store.ingridients?.includes(col);

export interface IHandleInheritedChanges {
  col: string;
  theKey: string;
}
export const handleInheritedChanges = ({
  col,
  theKey,
}: IHandleInheritedChanges) => {
  if (!isChangeAffectsGroup(col)) return;
  if (theKey.includes(",")) return;

  const tabType = store.tabs?.find((t) => t.id === store.activeTab)?.type;
  if (tabType !== "group") return;

  const row = store.data?.filter(({ ska1GlCode }) => ska1GlCode === theKey)[0];
  if (!row || !store.tabs || !store.groups) return;

  const newVirtKey = createVirtualGroupKey(row);
  const groupData = store.groups[newVirtKey];
  const ai = store.tabs.find((t) => t.id === store.activeTab)?.columns;
  const changeableAiCols = ai
    ? Object.keys(ai).filter((c) => ai[c].changeable === "y")
    : [];
  if (groupData) {
    changeableAiCols.forEach((c) => {
      const changedData = groupData[c as keyof typeof groupData];
      if (row[c as keyof typeof row] !== changedData)
        addChange(theKey, c, changedData);
    });
  } else {
    changeableAiCols.forEach((c) => {
      removeChange(theKey, c);
    });
  }
};

export const updateRows = async (shouldSave = true) => {
  if (!store.data) return;
  const searchFilter = document.getElementById(
    "filter-rows",
  ) as HTMLInputElement;
  const phrase = searchFilter ? searchFilter.value.toLowerCase() : "";
  refreshGroups();
  const type = store.tabs?.find((t) => t.id == store.activeTab)?.type;
  let cols: string[];
  if (type === "tableF" && store.groupsFiltered && store.groupKeysFiltered) {
    cols = Object.keys(store.groupsFiltered[store.groupKeysFiltered[0]]);
    store.rows = store.groupKeysFiltered
      .filter((r) =>
        JSON.stringify(store.groupsFiltered ? store.groupsFiltered[r] : [])
          .toLowerCase()
          .includes(phrase),
      )
      .map((r) => renderRowF({ r, cols }));
  } else {
    cols = getColumns(store.data);
    store.rows = store.data
      .filter((r) => JSON.stringify(r).toLowerCase().includes(phrase))
      .map((row) => renderRow({ row, cols }));
  }

  store.clusterize?.update(store.rows);

  refreshGroups();
  if (store.activeTab === "ai") {
    renderAiTab();
  }

  store.changes && (await postData(URL, store.changes));

  if (shouldSave) {
    const btn = document.querySelector("button.btn") as HTMLButtonElement;
    if (!btn) return;
    btn.innerText = "Save";
    btn.classList.remove("btn--hidden");
  }
};

export const updateRightContent = (groupId: string) => {
  if (!store.groupKeys) return;
  store.selectedGroup = store.groupKeys?.includes(groupId)
    ? groupId
    : store.groupKeys[0];

  const aiCenter = document.querySelector(
    ".ai-box__center > article",
  ) as HTMLDivElement;

  aiCenter.innerHTML = renderAiCenter(store.selectedGroup);

  const aiRight = document.querySelector(
    ".ai-box__right > article",
  ) as HTMLDivElement;

  aiRight.innerHTML = renderAiRight(store.selectedGroup);
};

export const renderTableTab = async () => {
  document.querySelector(".tab__content").innerHTML = Table(store.data);
  await initClusterize();
};

export const renderForm = ({ row, cols }) => {
  const ai = store.tabs.find((t) => t.id === store.activeTab).columns;
  const theKey = Object.keys(row.ska1GlCodes);
  const columns = cols
    .map((c) => {
      const { type } = store.types[c] || { type: "checkboxList" };
      const val = row[c];
      const isDisabled = ai[c] && ai[c].changeable !== "y";

      if (
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
  const row = store.data.find((r) => r.ska1GlCode === gl);
  const color = createMappedValue({ type: "mappedInScopeSka1GlCodes", row });
  const style = color ? ` style="color: ${color}";` : "";
  return style;
};

export const renderAiCenter = (groupId = store.groupKeys[0]) => {
  if (!store.groups) return "";
  const row = store.groups[groupId];
  const cols = Object.keys(row);
  return renderForm({ row, cols });
};

export const renderAiRight = (
  groupId = store.groupKeys && store.groupKeys[0],
) => {
  if (!store.groups) return "";
  const row = store.groups[groupId as keyof typeof store.groups];
  const cols = Object.keys(row);
  return renderAffectedItems({ row, cols });
};

export const renderSapClient = () => {
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

export const renderAiTab = () => {
  const tabContent = document.querySelector(".tab__content") as HTMLDivElement;
  tabContent.innerHTML = ai();
  store.selectedGroup = currentOrFirstGroup();
  updateRightContent(store.selectedGroup);
  const activeLabel = document.getElementById("active-label") as HTMLDivElement;
  activeLabel.scrollIntoView();
};
