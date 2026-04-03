export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface CategoryUpdateRequest extends CategoryRequest {
  id: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Transaction DTOs
export interface TransactionRequest {
  amount: number | string;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  categoryId?: number;
}

export interface TransactionResponse {
  id: number;
  user: User;
  category?: Category;
  amount: number;
  type: TransactionType;
  description: string;
  transactionDate: string;
  isRecurringInstance: boolean;
  linkedRecurringTransactionId?: number;
  createdAt: string;
  updatedAt: string;
}

// Recurring Transaction DTOs
export interface RecurringTransactionRequest {
  name: string;
  amount: number | string;
  type: TransactionType;
  description?: string;
  frequency: Frequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  categoryId?: number;
}

export interface RecurringTransactionResponse {
  id: number;
  user: User;
  category?: Category;
  name: string;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: Frequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Budget DTOs
export interface BudgetRequest {
  name: string;
  limitAmount: number | string;
  period: BudgetPeriod;
  alertThreshold?: number | string;
  startDate: string;
  categoryIds?: number[];
}

export interface BudgetResponse {
  id: number;
  user?: User;
  name: string;
  limitAmount: number;
  period: BudgetPeriod;
  alertThreshold?: number;
  startDate: string;
  currentSpent: number;
  remainingAmount: number;
  spentPercentage: number;
  isOverBudget: boolean;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

// Alert DTO
export interface AlertResponse {
  id: number;
  user?: User;
  type: string;
  message: string;
  relatedEntityType: string;
  relatedEntityId?: number;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics DTOs
export interface SpendingByCategoryResponse {
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface MonthlySpendingResponse {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface AnalyticsResponse {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  spendingByCategory: SpendingByCategoryResponse[];
  monthlySpending: MonthlySpendingResponse[];
  startDate: string;
  endDate: string;
}

// Re-export currency types for convenience
export * from './currency';
