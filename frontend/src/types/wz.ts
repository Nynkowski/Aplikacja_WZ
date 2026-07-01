export type WzRegularItem = {
  id: string | number;
  userId?: string | null;
  senderId?: string | null;
  recipientId?: string | null;
  sealNumber?: string | null;
  carPlates?: string | null;
  createdDate?: string | null;
  [key: string]: unknown;
};

export type WzRegularItemApi = {
  id: number;
  user_id: string;
  sender_id: string;
  recipient_id: string;
  seal_number: string;
  car_plates: string;
  created_date: string;
};

export type WzRegularFilters = {
  userId?: string;
  senderId?: string;
  recipientId?: string;
  sealNumber?: string;
  carPlates?: string;
  createdDate?: string;
};

export type GetOpenWzRegularParams = WzRegularFilters & {
  page?: number;
  pageSize?: number;
};

export type WzRegularListResult = {
  items: WzRegularItem[];
  total: number;
  totalPages?: number;
  page?: number;
  hasNextPage: boolean;
  isServerPaginated: boolean;
};

export type WzRegularContentItem = {
  id: number;
  contentDescription: string;
  addingUser: string;
  addedDate: string;
};

export type WzRegularEditData = {
  id: number;
  username: string;
  senderId: string;
  recipientId: string;
  sealNumber: string;
  carPlates: string;
  createdDate: string;
  contentList: WzRegularContentItem[];
};

export type WzRegularEditFormValues = {
  username: string;
  senderId: string;
  recipientId: string;
  sealNumber: string;
  carPlates: string;
};

export type WzRegularCreateResult = {
  id: number;
};

export type AdressOption = {
  id: number;
  name: string;
  fullAdress: string;
};
