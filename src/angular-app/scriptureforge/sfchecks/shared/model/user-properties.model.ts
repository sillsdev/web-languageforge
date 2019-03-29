export interface UserProperties {
  userProfilePickLists: UserProfilePickLists;
  userProfilePropertiesEnabled: string[]; // array of property keys
}

export interface UserProfilePickLists { [property: string]: PickList; }

export interface PickList {
  id: string;
  name: string;
  items: PickItem[];
  defaultKey: string;
}

interface PickItem {
  key: string;
  value: string;
}
