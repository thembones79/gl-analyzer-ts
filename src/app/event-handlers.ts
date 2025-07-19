import { store } from "./store";

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

const onOptionClick = (id, val) => {
  const input = document.getElementById(id);
  if (input.value === val) return;
  input.value = val;
  input.onchange();
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
