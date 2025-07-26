// Renderers perform DOM manipulations
// Name starts with render

import {
  store,
  type TRow,
  type TGroups,
  type ICreateMappedValue,
  type IGroups,
} from "./store";
import { postData, params, URL } from "./api";

import {
  renderFooter,
  renderRow,
  renderRowF,
  Table,
  renderTag,
} from "./components";

import { addChange, removeChange, getColumns } from "./data-transformers";

import { initClusterize } from "./init";

export const reRenderFooter = () => {
  const footer = document.querySelector(".footer");
  if (!footer) return;
  footer.outerHTML = renderFooter();
};


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
  if (!store.data) return;
  const tabContent = document.querySelector(".tab__content") as HTMLDivElement;
  tabContent.innerHTML = Table(store.data);
  await initClusterize();
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
