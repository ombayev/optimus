import * as fromPagination from '../actions/pagination.action';

export interface PaginationState {
  indexes: {
    previous: number;
    current: number;
    next: number;
  };
  links: string[];
}

export const initialState: PaginationState = {
  indexes: {
    previous: null,
    current: null,
    next: null
  },
  links: []
};

export function reducer(
  state = initialState,
  action: fromPagination.PaginationActions
): PaginationState {
  switch (action.type) {
    case fromPagination.RESET_PAGINATION:
      return {
        ...state,
        ...initialState
      };

    case fromPagination.START_NEW_PAGE:
      return {
        ...state,
        indexes: { previous: null, current: 0, next: null },
        links: [action.url]
      };

    case fromPagination.ADD_NEXT_LINK:
      return {
        ...state,
        indexes: { ...state.indexes, next: state.indexes.current + 1 },
        links: [...state.links, action.url]
      };

    case fromPagination.NO_NEXT_LINK:
      return {
        ...state,
        indexes: { ...state.indexes, next: null }
      };

    default:
      return state;
  }
}

export const getPagination = (state: PaginationState) => state;
export const getPageIndexes = (state: PaginationState) => state.indexes;
export const getPageCurrentIndex = (state: PaginationState) =>
  state.indexes.current;
export const getPageLinks = (state: PaginationState) => state.links;
