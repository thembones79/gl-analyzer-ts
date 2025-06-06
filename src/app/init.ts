import { getData, URL } from "./api";
import { updateTab } from "./event-handlers";
import { store } from "./store";

declare global {
  interface Window {
    updateTab?: any;
  }
}

export const initApp = async () => {
  window.updateTab = updateTab;

  store.changes = await getData(`${URL}&d=changes`);
  store.lookup = await getData(`${URL}&d=lookup`);
  store.tabs = await getData(`${URL}&d=tabs`);
  store.types = await getData(`${URL}&d=types`);
  store.perm = await getData(`${URL}&d=perm`);
  store.data = await getData(URL);
  store.activeTab = window.tabs[0].id;
  store.ingridients = window.lookup[`virtualKey_${window.activeTab}`];
  store.locked = window.perm?.canEdit === false;

  try {
    refreshGroups();
    store.selectedGroup = store.groupKeys[0];
  } catch (error) {
    console.log("E", { error });
  }
  const table = renderTable(store.data);
  const topTabs = store.tabs.map((t) => {
    return {
      id: t.id,
      label: t.label,
      content: table,
    };
  });

  renderSapClient();

  const searchFilter = document.getElementById("filter-rows");
  searchFilter.addEventListener("keyup", (e) => {
    updateRows(false);
  });

  const page = renderTabs(topTabs);
  document.getElementById("app").outerHTML = page;

  await initClusterize();
  // await askForPermission();
  if (!store.locked) {
    await longPoolingChanges();
  }
};
async function initClusterize() {
  store.clusterize = await new Clusterize({
    rows: store.rows,
    scrollId: "scrollArea",
    contentId: "contentArea",
  });
  await updateRows(false);
}
