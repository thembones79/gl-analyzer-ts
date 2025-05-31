
export const updateTab = async ( tabId:string ) => {
    console.log({tabId})
  window.activeTab = tabId;
  const tabType = window.tabs.find((t) => t.id === tabId).type;
  window.ingridients = window.lookup[`virtualKey_${tabId}`];
  if (tabType === "group") return renderAiTab();
  return await renderTableTab();
};
