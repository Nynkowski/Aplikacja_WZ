import type {
  AdressOption,
  GetOpenWzRegularParams,
  WzRegularCreateResult,
  WzRegularEditData,
  WzRegularItem,
  WzRegularListResult,
} from "../types/wz";
import { api } from "./api";

function pickValue<T>(...values: Array<T | null | undefined>): T | undefined {
  return values.find((value) => value !== undefined && value !== null);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toDisplayString(value: unknown): string | undefined {
  const directString = toTrimmedString(value);

  if (directString) {
    return directString;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return pickValue(
      toTrimmedString(record.username),
      toTrimmedString(record.userName),
      toTrimmedString(record.name),
      toTrimmedString(record.email),
      toTrimmedString(record.id),
      typeof record.id === "number" ? String(record.id) : undefined,
    );
  }

  return undefined;
}

function mapApiItem(raw: Record<string, unknown>): WzRegularItem {
  const id = pickValue(
    toNumber(raw.id),
    toNumber(raw.ID),
    toNumber(raw.wz_id),
    toNumber(raw.wzId),
  );

  return {
    id: id ?? "-",
    userId: pickValue(
      toDisplayString(raw.user_id),
      toDisplayString(raw.userId),
      toDisplayString(raw.user),
      toDisplayString(raw.username),
      toDisplayString(raw.user_name),
      toDisplayString(raw.created_by),
      toDisplayString(raw.createdBy),
    ),
    senderId: pickValue(
      toDisplayString(raw.sender_id),
      toDisplayString(raw.senderId),
      toDisplayString(raw.sender),
    ),
    recipientId: pickValue(
      toDisplayString(raw.recipient_id),
      toDisplayString(raw.recipientId),
      toDisplayString(raw.recipient),
    ),
    sealNumber: pickValue(
      toDisplayString(raw.seal_number),
      toDisplayString(raw.sealNumber),
      toDisplayString(raw.seal),
    ),
    carPlates: pickValue(
      toDisplayString(raw.car_plates),
      toDisplayString(raw.carPlates),
      toDisplayString(raw.plates),
    ),
    createdDate: pickValue(
      toDisplayString(raw.created_date),
      toDisplayString(raw.createdDate),
    ),
  };
}

function extractRows(payload: unknown): {
  rows: Record<string, unknown>[];
  total?: number;
  totalPages?: number;
  page?: number;
  isServerPaginated: boolean;
} {
  if (Array.isArray(payload)) {
    return {
      rows: payload as Record<string, unknown>[],
      total: payload.length,
      totalPages: undefined,
      page: undefined,
      isServerPaginated: false,
    };
  }

  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const nestedData =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : undefined;
    const arrays = [
      root.items,
      root.data,
      root.results,
      root.rows,
      nestedData?.items,
      nestedData?.rows,
      nestedData?.results,
    ];
    const rows = arrays.find((value) => Array.isArray(value)) as
      | Record<string, unknown>[]
      | undefined;

    const pagination = [root.pagination, root.meta, root.pageInfo].find(
      (value) => value && typeof value === "object",
    ) as Record<string, unknown> | undefined;

    const total = pickValue(
      toNumber(root.total),
      toNumber(root.count),
      toNumber(root.totalCount),
      toNumber(root.total_pages),
      toNumber(pagination?.total),
      toNumber(pagination?.count),
      toNumber(pagination?.totalCount),
      toNumber(pagination?.total_items),
      toNumber(pagination?.totalItems),
      toNumber(nestedData?.total),
      toNumber(nestedData?.count),
      toNumber(nestedData?.totalCount),
    );

    const totalPages = pickValue(
      toNumber(root.totalPages),
      toNumber(root.total_pages),
      toNumber(root.pages),
      toNumber(pagination?.totalPages),
      toNumber(pagination?.total_pages),
      toNumber(pagination?.pages),
      toNumber(nestedData?.totalPages),
      toNumber(nestedData?.total_pages),
    );

    const page = pickValue(
      toNumber(root.page),
      toNumber(root.currentPage),
      toNumber(root.current_page),
      toNumber(pagination?.page),
      toNumber(pagination?.currentPage),
      toNumber(pagination?.current_page),
      toNumber(nestedData?.page),
      toNumber(nestedData?.currentPage),
      toNumber(nestedData?.current_page),
    );

    return {
      rows: rows ?? [],
      total,
      totalPages,
      page,
      isServerPaginated:
        total !== undefined || totalPages !== undefined || page !== undefined,
    };
  }

  return {
    rows: [],
    total: 0,
    totalPages: undefined,
    page: undefined,
    isServerPaginated: false,
  };
}

export async function getOpenWzRegular(
  params: GetOpenWzRegularParams = {},
): Promise<WzRegularListResult> {
  const query = {
    page: params.page,
    pageSize: params.pageSize,
    page_size: params.pageSize,
    user_id: params.userId?.trim() || undefined,
    sender_id: params.senderId?.trim() || undefined,
    recipient_id: params.recipientId?.trim() || undefined,
    seal_number: params.sealNumber?.trim() || undefined,
    car_plates: params.carPlates?.trim() || undefined,
    created_date: params.createdDate?.trim() || undefined,
  };

  const response = await api.get<unknown>("/wz-regular/open", {
    params: query,
  });

  const extracted = extractRows(response.data);
  const items = extracted.rows.map(mapApiItem);
  const fallbackHasNextPage =
    extracted.isServerPaginated &&
    Boolean(params.pageSize) &&
    items.length === params.pageSize;
  const hasNextPage =
    extracted.totalPages && extracted.page
      ? extracted.page < extracted.totalPages
      : fallbackHasNextPage;

  return {
    items,
    total: extracted.total ?? items.length,
    totalPages: extracted.totalPages,
    page: extracted.page,
    hasNextPage,
    isServerPaginated: extracted.isServerPaginated,
  };
}

function mapEditContentItem(raw: Record<string, unknown>) {
  return {
    id: toNumber(raw.id) ?? 0,
    contentDescription:
      pickValue(
        toDisplayString(raw.content_description),
        toDisplayString(raw.contentDescription),
      ) ?? "",
    addingUser:
      pickValue(
        toDisplayString(raw.adding_user),
        toDisplayString(raw.addingUser),
        toDisplayString(raw.adding_user_name),
        toDisplayString(raw.addingUserName),
        toDisplayString(raw.username),
        toDisplayString(raw.user),
        toDisplayString(raw.adding_user_id),
        toDisplayString(raw.addingUserId),
      ) ?? "",
    addedDate:
      pickValue(
        toDisplayString(raw.added_date),
        toDisplayString(raw.addedDate),
      ) ?? "",
  };
}

export async function createWzRegularContent(
  wzId: number,
  payload: { contentDescription: string; addingUserId: number },
) {
  if (!Number.isFinite(payload.addingUserId)) {
    throw new Error("Brak poprawnego adding_user_id.");
  }

  const response = await api.post<unknown>(`/wz-regular/${wzId}/content`, {
    content_description: payload.contentDescription,
    adding_user_id: payload.addingUserId,
  });

  const responseData = response.data;

  if (!responseData || typeof responseData !== "object") {
    throw new Error("Nieprawidlowy format odpowiedzi przy dodawaniu pozycji.");
  }

  const root = responseData as Record<string, unknown>;
  const nestedData =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;

  return mapEditContentItem(nestedData ?? root);
}

export async function createWzRegular(payload: {
  userId: number;
  senderId: string;
  recipientId: string;
  sealNumber: string;
  carPlates: string;
}): Promise<WzRegularCreateResult> {
  const response = await api.post<unknown>("/wz-regular", {
    user_id: payload.userId,
    sender_id: payload.senderId,
    recipient_id: payload.recipientId,
    seal_number: payload.sealNumber,
    car_plates: payload.carPlates,
  });

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Nieprawidlowy format odpowiedzi przy tworzeniu WZ.");
  }

  const id = toNumber((response.data as Record<string, unknown>).id);

  if (!id) {
    throw new Error("Brak ID nowego WZ w odpowiedzi.");
  }

  return { id };
}

export async function deleteWzRegularContent(
  wzId: number,
  contentId: number,
): Promise<void> {
  await api.delete(`/wz-regular/${wzId}/content/${contentId}`);
}

export async function updateWzRegular(
  wzId: number,
  payload: {
    senderId: string;
    recipientId: string;
    sealNumber: string;
    carPlates: string;
  },
): Promise<WzRegularEditData> {
  const response = await api.patch<unknown>(`/wz-regular/${wzId}`, {
    sender_id: payload.senderId,
    recipient_id: payload.recipientId,
    seal_number: payload.sealNumber,
    car_plates: payload.carPlates,
  });

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Nieprawidlowy format odpowiedzi przy zapisie WZ.");
  }

  const raw = response.data as Record<string, unknown>;
  const rawContentList = Array.isArray(raw.content_list)
    ? raw.content_list
    : Array.isArray(raw.contentList)
      ? raw.contentList
      : [];

  return {
    id: toNumber(raw.id) ?? wzId,
    username:
      pickValue(
        toDisplayString(raw.username),
        toDisplayString(raw.user_id),
        toDisplayString(raw.userId),
      ) ?? "",
    senderId:
      pickValue(
        toDisplayString(raw.sender_id),
        toDisplayString(raw.senderId),
      ) ?? "",
    recipientId:
      pickValue(
        toDisplayString(raw.recipient_id),
        toDisplayString(raw.recipientId),
      ) ?? "",
    sealNumber:
      pickValue(
        toDisplayString(raw.seal_number),
        toDisplayString(raw.sealNumber),
      ) ?? "",
    carPlates:
      pickValue(
        toDisplayString(raw.car_plates),
        toDisplayString(raw.carPlates),
      ) ?? "",
    createdDate:
      pickValue(
        toDisplayString(raw.created_date),
        toDisplayString(raw.createdDate),
      ) ?? "",
    contentList: (rawContentList as Record<string, unknown>[]).map(
      mapEditContentItem,
    ),
  };
}

export async function getWzRegularEditById(
  id: number,
): Promise<WzRegularEditData> {
  const response = await api.get<unknown>(`/wz-regular/${id}/edit`);

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Nieprawidlowy format odpowiedzi dla szczegolow WZ.");
  }

  const raw = response.data as Record<string, unknown>;
  const rawContentList = Array.isArray(raw.content_list)
    ? raw.content_list
    : Array.isArray(raw.contentList)
      ? raw.contentList
      : [];

  return {
    id: toNumber(raw.id) ?? id,
    username:
      pickValue(
        toDisplayString(raw.username),
        toDisplayString(raw.user_id),
        toDisplayString(raw.userId),
      ) ?? "",
    senderId:
      pickValue(
        toDisplayString(raw.sender_id),
        toDisplayString(raw.senderId),
      ) ?? "",
    recipientId:
      pickValue(
        toDisplayString(raw.recipient_id),
        toDisplayString(raw.recipientId),
      ) ?? "",
    sealNumber:
      pickValue(
        toDisplayString(raw.seal_number),
        toDisplayString(raw.sealNumber),
      ) ?? "",
    carPlates:
      pickValue(
        toDisplayString(raw.car_plates),
        toDisplayString(raw.carPlates),
      ) ?? "",
    createdDate:
      pickValue(
        toDisplayString(raw.created_date),
        toDisplayString(raw.createdDate),
      ) ?? "",
    contentList: (rawContentList as Record<string, unknown>[]).map(
      mapEditContentItem,
    ),
  };
}

function mapAdressOption(raw: Record<string, unknown>): AdressOption {
  const name =
    pickValue(toDisplayString(raw.name), toDisplayString(raw.adress_name)) ??
    "";

  return {
    id: toNumber(raw.id) ?? 0,
    name,
    fullAdress:
      pickValue(
        toDisplayString(raw.full_adress),
        toDisplayString(raw.fullAdress),
        toDisplayString(raw.full_address),
      ) ?? name,
  };
}

export async function getAdresses(): Promise<AdressOption[]> {
  const response = await api.get<unknown>("/adresses");
  const payload = response.data;

  if (Array.isArray(payload)) {
    return (payload as Record<string, unknown>[]).map(mapAdressOption);
  }

  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    const nestedData =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : undefined;

    const rows = [
      root.items,
      root.data,
      root.results,
      root.rows,
      nestedData?.items,
      nestedData?.rows,
      nestedData?.results,
    ].find((value) => Array.isArray(value)) as
      | Record<string, unknown>[]
      | undefined;

    return (rows ?? []).map(mapAdressOption);
  }

  return [];
}
