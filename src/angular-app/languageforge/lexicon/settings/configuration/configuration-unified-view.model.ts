// imports?

export class ConfigurationUnifiedViewModel {

  // Settings objects for Entry Fields
  entryFields: FieldSettings[];

  // Settings objects for Sense Fields
  senseFields: FieldSettings[];

  // Settings objects for Example Fields
  exampleFields: FieldSettings[];

  // Settings objects for Input System
  inputSystem: InputSystemSettings[];

  constructor(numEntryFields: number, numSenseFields: number, numExampleFields: number, numInputSystem: number) {
    this.entryFields = [];
    for (let i = 0; i < numEntryFields; i++) {
      this.entryFields[i] = new FieldSettings();
    }

    this.senseFields = [];
    for (let i = 0; i < numSenseFields; i++) {
      this.senseFields[i] = new FieldSettings();
    }

    this.exampleFields = [];
    for (let i = 0; i < numExampleFields; i++) {
      this.exampleFields[i] = new FieldSettings();
    }

    this.inputSystem = [];
    for(let i = 0; i < numInputSystem; i++) {
      this.inputSystem[i] = new InputSystemSettings();
    }
  }
}

export class InputSystemSettings {
  name: string;
  observer: boolean;
  commenter: boolean;
  contributor: boolean;
  manager: boolean;
  groups: boolean[];
}

export class FieldSettings extends InputSystemSettings {
  hiddenIfEmpty: boolean;
}
