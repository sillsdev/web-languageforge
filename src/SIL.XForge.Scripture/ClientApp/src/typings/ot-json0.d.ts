/** See https://github.com/ottypes/json0 */
declare module 'ot-json0' {
  import { OTType } from 'sharedb/lib/client';

  export let type: OTType;

  export type OtJson0Op = OtJson0OpNumber | OtJson0OpList | OtJson0OpObject | OtJson0OpSubtype | OtJson0OpString;

  export type OtJson0Path = (string | number)[];

  interface OtJson0OpBase {
    p: OtJson0Path;
  }

  interface OtJson0OpNumberAdd extends OtJson0OpBase {
    na: number;
  }

  type OtJson0OpNumber = OtJson0OpNumberAdd;

  interface OtJson0OpListInsert extends OtJson0OpBase {
    li: any;
  }
  interface OtJson0OpListDelete extends OtJson0OpBase {
    ld: any;
  }
  interface OtJson0OpListReplace extends OtJson0OpListDelete, OtJson0OpListInsert {}
  interface OtJson0OpListMove extends OtJson0OpBase {
    lm: number;
  }

  type OtJson0OpList = OtJson0OpListInsert | OtJson0OpListDelete | OtJson0OpListReplace | OtJson0OpListMove;

  interface OtJson0OpObjectInsert extends OtJson0OpBase {
    oi: any;
  }
  interface OtJson0OpObjectDelete extends OtJson0OpBase {
    od: any;
  }
  interface OtJson0OpObjectReplace extends OtJson0OpObjectDelete, OtJson0OpObjectInsert {}

  type OtJson0OpObject = OtJson0OpObjectInsert | OtJson0OpObjectDelete | OtJson0OpObjectReplace;

  interface OtJson0OpSubtype extends OtJson0OpBase {
    t: string;
    o: any[];
  }

  interface OtJson0OpStringInsert extends OtJson0OpBase {
    si: string;
  }
  interface OtJson0OpStringDelete extends OtJson0OpBase {
    sd: string;
  }

  type OtJson0OpString = OtJson0OpStringInsert | OtJson0OpStringDelete;
}
