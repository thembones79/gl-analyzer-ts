import { updateTab } from "./event-handlers";

export const initApp = async () => {
  window.updateTab = updateTab;

  window.changes = await getData(`${URL}&d=changes`);
  window.lookup = await getData(`${URL}&d=lookup`);
  window.tabs = await getData(`${URL}&d=tabs`);
  window.types = await getData(`${URL}&d=types`);
  window.perm = await getData(`${URL}&d=perm`);
  window.data = await getData(URL);
  window.activeTab = window.tabs[0].id;
  window.ingridients = window.lookup[`virtualKey_${window.activeTab}`];
  window.locked = window.perm?.canEdit === false;

  try {
    refreshGroups();
    window.selectedGroup = window.groupKeys[0];
  } catch (error) {
    console.log("E", { error });
  }
  const table = renderTable(window.data);
  const topTabs = window.tabs.map((t) => {
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
  if (!window.locked) {
    await longPoolingChanges();
  }
};
async function initClusterize() {
  window.clusterize = await new Clusterize({
    rows: window.rows,
    scrollId: "scrollArea",
    contentId: "contentArea",
  });
  await updateRows(false);
}
