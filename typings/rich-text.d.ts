declare module 'rich-text' {
  import { OTType } from "sharedb/lib/client";
  import * as Quill from "quill";

  export let Delta: Quill.Delta
  export let type: OTType;
}
