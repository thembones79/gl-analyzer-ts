import Clusterize from "clusterize.js";
import { renderApp, renderSapClient } from "./renderers";
import { getColumns, refreshGroups, updateRows } from "./data-transformers";
import { longPoolingChanges } from "./api";
import { getData, URL } from "./api";
import {
  updateTab,
  onChange,
  onChangeCheckbox,
  onChangeGroup,
  onOptionClick,
  onChangeSelect,
  onChangeFilters,
  onSave,
  onExportTableToCSVButtonClick,
} from "./event-handlers";
import { store, type TLookup } from "./store";
import { Row } from "./components";

declare global {
  interface Window {
    updateTab?: any;
    onChangeGroup?: any;
    onChange?: any;
    onChangeCheckbox?: any;
    onOptionClick?: any;
    onChangeSelect?: any;
    onChangeFilters?: any;
    onSave?: any;
  }
}

export const initApp = async () => {
  // bind event handlers into global scope
  window.updateTab = updateTab;
  window.onChange = onChange;
  window.onChangeCheckbox = onChangeCheckbox;
  window.onChangeGroup = onChangeGroup;
  window.onOptionClick = onOptionClick;
  window.onChangeSelect = onChangeSelect;
  window.onChangeFilters = onChangeFilters;
  window.onSave = onSave;

  // populate the store
  store.changes = await getData(`${URL}&get=delta`);
  store.lookup = await getData(`${URL}&get=glLookupFields`);
  store.tabs = await getData(`${URL}&get=glTableConfig`);
  store.types = await getData(`${URL}&get=glTableNames`);
  store.perm = await getData(`${URL}&get=perm`);
  store.data = await getData(`${URL}&get=glTable`);
  store.activeTab = store.tabs && store.tabs[0].id;
  store.ingridients = ((store.lookup &&
    store.lookup[`virtualKey_${store.activeTab}` as keyof TLookup]) ||
    []) as string[];
  store.locked = store.perm?.canEdit === false;
  store.rows =
    store.data &&
    store.data.map((row) => Row({ row, cols: getColumns(store.data || []) }));

  try {
    refreshGroups();
    store.selectedGroup = store.groupKeys ? store.groupKeys[0] : "";
  } catch (error) {
    console.log("E", { error });
  }

  renderSapClient();
  renderApp();
  await initClusterize();

  const searchFilter = document.getElementById("filter-rows");
  searchFilter &&
    searchFilter.addEventListener("keyup", () => {
      updateRows(false);
    });

  const downloadButton = document.querySelector("button");
  downloadButton && downloadButton.addEventListener("click",() => {onExportTableToCSVButtonClick("table.csv")});
  // await askForPermission();
  if (!store.locked) {
    await longPoolingChanges();
  }
};

export async function initClusterize() {
  if (!store.rows || (store.rows && !store.rows[0])) return;
  store.clusterize = new Clusterize({
    rows: store.rows,
    scrollId: "scrollArea",
    contentId: "contentArea",
  });
  await updateRows(false);
}
