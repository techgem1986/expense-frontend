/**
 * Account types for the expense management system.
 */
export type AccountTypeEnum = 
  | 'SAVINGS' 
  | 'CHECKING' 
  | 'LOAN' 
  | 'INVESTMENT' 
  | 'MUTUAL_FUND' 
  | 'CREDIT_CARD' 
  | 'CASH' 
  | 'OTHER';

/**
 * Display names for account types.
 */
export const AccountTypeDisplayNames: Record<AccountTypeEnum, string> = {
  SAVINGS: 'Savings Account',
  CHECKING: 'Checking Account',
  LOAN: 'Loan',
  INVESTMENT: 'Investment',
  MUTUAL_FUND: 'Mutual Fund',
  CREDIT_CARD: 'Credit Card',
  CASH: 'Cash',
  OTHER: 'Other',
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