export class User {
  constructor(
    public id: number,
    public email: string,
    public password: string,
    public firstName: string, 
    public lastName: string,
    public role: string
  ) { }
}