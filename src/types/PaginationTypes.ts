export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
