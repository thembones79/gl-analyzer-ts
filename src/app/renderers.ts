// Renderers perform DOM manipulations
// Name starts with render

import { store } from "./store";
import { params } from "./api";
import {
  Ai,
  AiRight,
  AiCenter,
  Footer,
  Tabs,
  Table,
  AiLeft,
  Placeholder,
} from "./components";
import { currentOrFirstGroup } from "./data-transformers";
import { initClusterize } from "./init";

export const reRenderFooter = () => {
  const footer = document.querySelector(".footer");
  if (!footer) return;
  footer.outerHTML = Footer();
};

export const updateLeftContent = () => {
  const aiLeft = document.querySelector(".ai-box__left") as HTMLDivElement;

  aiLeft.innerHTML = AiLeft();
};

export const updateRightContent = (groupId: string) => {
  if (!store.groupKeys) return;
  store.selectedGroup = store.groupKeys?.includes(groupId)
    ? groupId
    : store.groupKeys[0];

  const aiCenter = document.querySelector(
    ".ai-box__center > article",
  ) as HTMLDivElement;

  aiCenter.innerHTML = AiCenter(store.selectedGroup);

  const aiRight = document.querySelector(
    ".ai-box__right > article",
  ) as HTMLDivElement;

  aiRight.innerHTML = AiRight(store.selectedGroup);
};

export const renderTableTab = async () => {
  if (!store.data) return;
  const tabContent = document.querySelector(".tab__content") as HTMLDivElement;
  tabContent.innerHTML = Table(store.data);
  await initClusterize();
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

export const renderAiTab = (doNotRefreshCenterForm?: boolean) => {
  const tabContent = document.querySelector(".tab__content") as HTMLDivElement;
  if (doNotRefreshCenterForm) {
    updateLeftContent();
  } else {
    tabContent.innerHTML = Ai();
    store.selectedGroup = currentOrFirstGroup();
    updateRightContent(store.selectedGroup);
  }

  const activeLabel = document.getElementById("active-label") as HTMLDivElement;
  activeLabel.scrollIntoView();
};

export const renderApp = () => {
  const table = Table(store.data);
  const topTabs = store.tabs?.map((t) => {
    return {
      id: t.id,
      label: t.label,
      content: table,
    };
  });
  const page = Tabs(topTabs || []);
  const app = document.getElementById("app") as HTMLDivElement;
  app.outerHTML = page;
};

export const reRenderPlaceholder = () => {
  const placeholder = document.querySelector(".placeholder") as HTMLDivElement;
  if (placeholder) {
    placeholder.outerHTML = Placeholder();
  }
};
