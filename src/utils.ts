export const getPathTail = (fullPath: string) => {
  const splitPath = fullPath.split("/");
  return splitPath.at(splitPath.length - 1);
};
