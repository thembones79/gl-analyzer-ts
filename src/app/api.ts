import { store, type TChanges } from "./store";
import { updateRows } from "./data-transformers";
import { reRenderFooter } from "./renderers";
export const host = document.querySelector("body")?.dataset?.url || "/";
export const params = window.location.search;
export const URL = host + params;

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
    const pooledChanges = await getData<TChanges>(`${URL}&d=changes`);
    store.changes = { ...pooledChanges };
    await updateRows(false);
    info?.classList.add("sync-info--hidden");
  }, 13000);
};

export const askForPermission = async () => {
  setInterval(async () => {
    store.perm = await getData(`${URL}&d=perm`);
    if (!store.perm?.canEdit) reRenderFooter();
  }, 3000);
};
