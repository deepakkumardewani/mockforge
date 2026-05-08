export interface ApiMeta {
  entity: string;
  generatedAt: string;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
  meta: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
