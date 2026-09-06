// Bentuk-bentuk ini SENGAJA dicerminkan persis dari backend
// (ResponseInterceptor, AllExceptionsFilter, dan skema Drizzle) supaya
// frontend & backend "bicara" dalam kontrak tipe yang sama.

export interface ApiSuccessResponse<T> {
	success: true;
	statusCode: number;
	message: string;
	data: T;
	meta?: PaginationMeta;
	timestamp: string;
	path: string;
}

export interface ApiErrorResponse {
	success: false;
	statusCode: number;
	message: string;
	errors?: unknown;
	timestamp: string;
	path: string;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
}

export interface SafeUser {
	id: number;
	email: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface Profile {
	id: number;
	userId: number;
	fullName: string | null;
	avatarUrl: string;
	phone: string | null;
	bio: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Role {
	id: number;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Permission {
	id: number;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface RoleUserSummary {
	id: number;
	email: string;
	isActive: boolean;
}

export type SortOrder = 'asc' | 'desc';
