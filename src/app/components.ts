export const Table = (data) => {
  const cols = getColumns(data);
  const header = renderHeader(cols);
  const body = renderTableBody();
  return `<div class="table-container" id="scrollArea" ><table>${header}${body}</table></div>`;
};
