import { store, type TChanges } from "./store";
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
