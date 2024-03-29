export type UserDetails = {
  username: string,
  password: string,
  name: string,
  email: string,
}

export type Project = {
  name: string,
  code: string,
  id: string
}

export type TestProject = {
  project(): Project,
  entryIds(): string[],
}
