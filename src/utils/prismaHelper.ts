import { PaginationOptions } from '../types/PaginationTypes';

export const calculatePagination = (options: PaginationOptions) => {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;

    return {
        skip,
        take: limit,
        page,
        limit
    };
};
