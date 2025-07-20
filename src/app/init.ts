import Clusterize from "clusterize.js";
import { renderTabs, Table } from "./components";
import { refreshGroups, updateRows, renderSapClient } from "./renderers";
import { longPoolingChanges } from "./api";
import { getData, URL } from "./api";
import { updateTab } from "./event-handlers";
import { store, type TLookup } from "./store";

declare global {
  interface Window {
    updateTab?: any;
  }
}

export const initApp = async () => {
  // bind event handlers into global scope
  window.updateTab = updateTab;

  // populate the store
  store.changes = await getData(`${URL}&d=changes`);
  store.lookup = await getData(`${URL}&d=lookup`);
  store.tabs = await getData(`${URL}&d=tabs`);
  store.types = await getData(`${URL}&d=types`);
  store.perm = await getData(`${URL}&d=perm`);
  store.data = await getData(URL);
  store.activeTab = store.tabs && store.tabs[0].id;
  store.ingridients = ((store.lookup &&
    store.lookup[`virtualKey_${store.activeTab}` as keyof TLookup]) ||
    []) as string[];
  store.locked = store.perm?.canEdit === false;

  try {
    refreshGroups();
    store.selectedGroup = store.groupKeys ? store.groupKeys[0] : "";
  } catch (error) {
    console.log("E", { error });
  }
  const table = Table(store.data);
  const topTabs = store.tabs?.map((t) => {
    return {
      id: t.id,
      label: t.label,
      content: table,
    };
  });

  renderSapClient();

  const searchFilter = document.getElementById("filter-rows");
  searchFilter &&
    searchFilter.addEventListener("keyup", () => {
      updateRows(false);
    });

  const page = renderTabs(topTabs || []);
  const app = document.getElementById("app") as HTMLDivElement;
  app.outerHTML = page;

  await initClusterize();
  // await askForPermission();
  if (!store.locked) {
    await longPoolingChanges();
  }
};
export async function initClusterize() {
  store.clusterize = new Clusterize({
    rows: store.rows,
    scrollId: "scrollArea",
    contentId: "contentArea",
  });
  await updateRows(false);
}
