
export interface Account {
  id: string;
  name: string;
  email: string;
  type: string;
  registered: string;
  status: string;
  phone: string;
  address: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface ActionMenuItem {
  label: string;
  onClick: (account: Account) => void;
}
