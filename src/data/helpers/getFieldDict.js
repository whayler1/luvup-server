const selectionToDict = selections =>
  selections.reduce(
    (obj, selection) => ({
      ...obj,
      [selection.name.value]: selection.selectionSet
        ? selectionToDict(selection.selectionSet.selections)
        : null,
    }),
    {},
  );

const getFieldDict = ast =>
  selectionToDict(ast.fieldNodes[0].selectionSet.selections);

export default getFieldDict;
