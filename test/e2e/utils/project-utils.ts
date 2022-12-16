export type Project = {
  name: string,
  code: string,
  id: string
}

// code as it is generated based on the project name
export const toProjectCode = (name: string): string => name.toLowerCase().replace(/ /g, '_');

export const toProject = (name: string, id?: string): Project => ({
  name,
  code: toProjectCode(name),
  id: id ?? '',
});
