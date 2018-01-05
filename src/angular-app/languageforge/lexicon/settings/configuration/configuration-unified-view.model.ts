// imports?

export class ConfigurationUnifiedViewModel {

  // Settings objects for Entry Fields
  entryFields : FieldSettings[];

  // Settings objects for Sense Fields
  senseFields : FieldSettings[];

  constructor(numEntryFields : number, numSenseFields : number) {
    this.entryFields = [];
    for(let i = 0; i < numEntryFields; i++) {
      this.entryFields[i] = new FieldSettings();
    }

    this.senseFields = [];
    for(let i = 0; i < numSenseFields; i++) {
      this.senseFields[i] = new FieldSettings();
    }
  }
  
}

export class FieldSettings {
  name: string;
  hiddenIfEmpty: boolean;
  observer: boolean;
  commenter: boolean;
  contributor: boolean;
  manager: boolean;
  groups: boolean[];
}
