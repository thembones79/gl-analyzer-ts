import {
  store,
  type TRow,
  type TGroups,
  type ICreateMappedValue,
} from "./store";

const aChng = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (!store.changes) return;
  if (!store.changes[theKey]) {
    store.changes[theKey] = { [col]: val };
  }
  store.changes[theKey][col] = val;
};

const rChng = (theKey: string, col: string) => {
  if (!store.changes) return;
  delete store.changes[theKey][col];
  if (!Object.keys(store.changes[theKey]).length) {
    delete store.changes[theKey];
  }
};

export const addChange = (
  theKey: string,
  col: string,
  val: string | boolean | string[] | Record<string, boolean>,
) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => aChng(k, col, val));
  } else {
    aChng(theKey, col, val);
  }
};

export const removeChange = (theKey: string, col: string) => {
  if (theKey.includes(",")) {
    theKey.split(",").forEach((k) => rChng(k, col));
  } else {
    rChng(theKey, col);
  }
};

export const getColumns = (data: TRow[]) => Object.keys(data[0]);

export const createVirtualGroupKey = (row: TRow) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  return store.ingridients
    ? store.ingridients
        .map((i) => {
          const ingridientValue =
            areChanges && areChanges[i] !== undefined
              ? areChanges[i]
              : row[i as keyof typeof row];
          if (i === "oneSided") return ingridientValue ? "1S" : "2S";
          return ingridientValue;
        })
        .filter(Boolean)
        .join("_")
    : "";
};

export const createMappedValue = ({ type, row }: ICreateMappedValue) => {
  const changedRecordKey = row.ska1GlCode;
  const areChanges = store.changes && store.changes[changedRecordKey];
  if (!store.lookup) return "";
  const { source, dict } = store.lookup[type];
  const sourceVal = source
    ? areChanges && areChanges[source]
      ? areChanges[source]
      : row[source as keyof typeof row]
    : "";
  const mappedVal =
    sourceVal !== undefined ? dict[sourceVal as keyof typeof dict] : "";

  return mappedVal;
};

export const createGroupedData = () => {
  const groups: TGroups = {};
  store?.data?.forEach((row) => {
    const vKey = createVirtualGroupKey(row) as keyof typeof groups;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = store.changes ? Object.keys(store.changes) : [];
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (!groups[vKey]) {
      const ska1GlCodes = {};
      groups[vKey] = { ...row, ska1GlCodes, groupChanged };
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
  });
  return groups;
};

const createGroupedDataFiltered = () => {
  const groups: TGroups = {};
  const filteredData = store.data
    ? store.data?.filter((row) => {
        const changedValue = store.changes && store.changes[row.ska1GlCode];
        if (changedValue === undefined) return row.inScope;
        const scope = changedValue.inScope;
        if (scope === undefined) return row.inScope;
        return scope;
      })
    : [];

  filteredData.forEach((row) => {
    const vKey = createVirtualGroupKey(row) as keyof typeof groups;
    const groupCodes = Object.keys(groups[vKey].ska1GlCodes);
    const changedCodes = store.changes ? Object.keys(store.changes) : [];
    const groupChanged =
      changedCodes.includes(row.ska1GlCode) &&
      groupCodes.includes(row.ska1GlCode);
    if (!groups[vKey]) {
      const ska1GlCodes = {};
      groups[vKey] = { ...row, ska1GlCodes, groupChanged };
    }
    groups[vKey].ska1GlCodes[row.ska1GlCode] = true;
  });
  return groups;
};

export const refreshGroups = () => {
  store.groups = createGroupedData();
  store.groupKeys = Object.keys(store.groups).filter(Boolean).sort();
  store.groupsFiltered = createGroupedDataFiltered();
  store.groupKeysFiltered = Object.keys(store.groupsFiltered)
    .filter(Boolean)
    .sort();
};

export const currentOrFirstGroup = () => {
  if (!store.groupKeys) return "";
  if (!store.selectedGroup) return store.groupKeys[0];
  if (store.groupKeys.includes(store.selectedGroup)) return store.selectedGroup;
  return store.groupKeys[0];
};
