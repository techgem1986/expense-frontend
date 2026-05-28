/**
 * Account types for the expense management system.
 */
export type AccountTypeEnum =
  | 'SAVINGS'
  | 'SALARY'
  | 'CURRENT'
  | 'INVESTMENT'
  | 'MUTUAL_FUND'
  | 'CREDIT_CARD';

/**
 * Display names for account types.
 */
export const AccountTypeDisplayNames: Record<AccountTypeEnum, string> = {
  SAVINGS: 'Savings',
  SALARY: 'Salary',
  CURRENT: 'Current',
  INVESTMENT: 'Investment',
  MUTUAL_FUND: 'Mutual Funds',
  CREDIT_CARD: 'Credit Cards',
};

/**
 * Account interface representing a user's financial account.
 */
export interface Account {
  id: number;
  userId: number;
  name: string;
  accountType: AccountTypeEnum;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  openingBalance: number;
  currentBalance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating or updating an account.
 */
export interface AccountRequest {
  name: string;
  accountType: AccountTypeEnum;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  openingBalance: number;
  description?: string;
}

/**
 * Account summary for dropdowns and lists.
 */
export interface AccountSummary {
  id: number;
  name: string;
  accountType: AccountTypeEnum;
  currentBalance: number;
  bankName?: string;
}
