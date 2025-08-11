import { store, type TChanges, type TRow } from "./store";
import { getData, postData, URL } from "./api";
import { renderAiTab, renderTableTab, updateRightContent } from "./renderers";
import {
  updateRows,
  handleInheritedChanges,
  addChange,
  removeChange,
} from "./data-transformers";

export const updateTab = async (tabId: string) => {
  store.activeTab = tabId;
  const tabType = store.tabs
    ? store.tabs.find((t) => t.id === tabId)?.type
    : "";
  store.ingridients = store.lookup
    ? store.lookup[`virtualKey_${tabId}` as keyof typeof store.ingridients]
    : [];
  store.multiFilteredRowData = undefined;
  if (tabType === "group") return renderAiTab();
  return await renderTableTab();
};

export const onChangeGroup = (self: HTMLInputElement) =>
  updateRightContent(self.value);

export const onOptionClick = (id: string, val: string) => {
  const input = document.getElementById(id) as HTMLInputElement;
  if (input.value === val) return;
  input.value = val;
  //@ts-ignore
  input.onchange();
};

export async function onChange(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  store.changes = await getData(`${URL}&d=changes`);
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

export async function onChangeFilters(self: HTMLInputElement) {
  if (!store.data) return;
  const columnId = self.id.split("_")[1] as keyof TRow;

  const notEmptyInputs = Array.from(
    document.querySelectorAll("[type='search']"),
    //@ts-ignore
  ).filter((i) => i.value !== "");

  const columnIds = notEmptyInputs.map((i) => i.id.split("_")[1]);
  console.log({ columnIds, notEmptyInputs });

  store.multiFilteredRowData = store.data.filter((row) => {
    const condition = (columnId: keyof TRow) => {
      const searchInput = document.querySelector(
        `#id_${columnId}`,
      ) as HTMLInputElement;
      const phrase = searchInput ? searchInput.value.toLowerCase() : "";

      return `${row[columnId]}`.toLowerCase().startsWith(phrase);
    };

    return condition(columnId);
  });
  updateRows(false);
}

export async function onChangeSelect(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  store.changes = await getData(`${URL}&d=changes`);
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

export async function onChangeCheckbox(
  self: HTMLInputElement,
  theKey: string,
  col: string,
) {
  getData(`${URL}&d=changes`).then((dc) => {
    store.changes = dc as TChanges;

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

export const onSave = async (btn: HTMLButtonElement) => {
  let res: any = {};
  btn.innerText = "Saving...";
  btn.classList.add("btn--hidden");
  res = store.changes && (await postData(URL, store.changes));
  btn.innerText = "Data was saved ✅";
  if (res.error) {
    btn.innerText = "Data was NOT saved ❌";
    setTimeout(() => {
      btn.innerText = "Save";
      btn.classList.remove("btn--hidden");
    }, 3000);
  }
};
