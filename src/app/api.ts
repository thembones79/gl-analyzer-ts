export const URL = document.querySelector("body")?.dataset?.url || "/";

export async function getData<T>(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    console.error(error.message);
  }
}

export async function postData(url: string, body: Record<string, any>) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: myHeaders,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(error.message);
    return { error };
  }
}

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

export const askForPermission = async () => {
  setInterval(async () => {
    window.perm = await getData(`${URL}&d=perm`);
    if (!window.perm.canEdit) reRenderFooter();
  }, 3000);
};
