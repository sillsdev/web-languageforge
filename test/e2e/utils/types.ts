// Types used in various E2E tests

export type Project = {
  name: string,
  code: string,
  id: string
}

export const toProject = (name: string, id?: string) => ({
  name,
  code: name.toLowerCase().replace(/ /g, '_'), // code as it is generated based on the project name
  id,
});
