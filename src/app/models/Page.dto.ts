export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: 'name' | 'createdAt' | 'cardCount' | 'averageDifficulty';
  sortDir?: 'asc' | 'desc';
  sizeFilter?: 'small' | 'medium' | 'large' | 'empty';
  minCards?: number;
}
