import { store, type TChanges } from "./store";
import { updateRows } from "./data-transformers";
import { reRenderPlaceholder } from "./renderers";
const host = document.querySelector("body")?.dataset?.url || "";
export const params = window.location.search;
export const URL = host + params;

const ERROR_MESSAGE =
  "Ups something went wrong... on BACK END! Please login and refresh the app. If the issue would last longer than 15 minutes, please report it to trash@siemens.com";

const setError = () => {
  const content = document.querySelector(".tab__content") as HTMLDivElement;

  if (content) {
    content.setAttribute("inert", "true");
  }

  reRenderPlaceholder();
};

const removeError = () => {
  const content = document.querySelector(".tab__content") as HTMLDivElement;

  if (content && !store.locked) {
    content.removeAttribute("inert");
  }

  reRenderPlaceholder();
};

export async function getData<T>(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    store.error = undefined;
    removeError();
    return data as T;
  } catch (error: any) {
    store.error = ERROR_MESSAGE;
    setError();
    console.error(error.message);
  }
}
export async function postData(url: string, body: Record<string, any>) {
  const formData = new FormData();
  formData.append("json", JSON.stringify(body));
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    store.error = undefined;
    removeError();
    return data;
  } catch (error: any) {
    store.error = ERROR_MESSAGE;
    setError();
    console.error(error.message);
    return { error };
  }
}

export const longPoolingChanges = async () => {
  setInterval(async () => {
    const info = document.querySelector(".sync-info");
    info?.classList.remove("sync-info--hidden");
    const pooledChanges = await getData<TChanges>(`${URL}&get=delta`);
    store.changes = { ...pooledChanges };
    await updateRows(false);
    info?.classList.add("sync-info--hidden");
  }, 13000);
};

export const askForPermission = async () => {
  setInterval(async () => {
    store.perm = await getData(`${URL}&get=perm`);
    store.locked = store.perm?.canEdit === false;
    if (store.locked) {
      setError();
    } else {
      removeError();
    }
  }, 3000);
};
