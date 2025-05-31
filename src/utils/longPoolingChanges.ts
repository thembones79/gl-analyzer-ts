export const longPoolingChanges = async () => {
  setInterval(async () => {
    const info = document.querySelector(".sync-info");
    info?.classList.remove("sync-info--hidden");
    const pooledChanges = await getData(`${URL}&d=changes`);
    window.changes = { ...pooledChanges };
    await updateRows(false);
    info?.classList.add("sync-info--hidden");
  }, 13000);
};
