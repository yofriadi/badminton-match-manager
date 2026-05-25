// Reusable types that can be shared across different features

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  fullAddress?: string;
}

/**
 * Time slot information
 */
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  courts: string[];
  date?: Date;
  label?: string;
}

/**
 * Common pagination info
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Common API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

/**
 * Form field validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Common loading states
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  value: any;
  operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
}
