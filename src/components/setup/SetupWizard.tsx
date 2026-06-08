import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Tags,
  Repeat,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Check,
  Landmark,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { accountAPI, categoryAPI, recurringTransactionAPI } from '../../services/api';

interface SetupWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface WizardAccount {
  name: string;
  accountType: string;
  openingBalance: string;
  bankName: string;
}

interface WizardCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
}

interface WizardRecurring {
  name: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  frequency: string;
  dayOfMonth: number;
  description: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
}

const STEPS = ['Welcome', 'Accounts', 'Categories', 'Recurring', 'Complete'] as const;

const PRESET_ACCOUNTS: WizardAccount[] = [
  { name: 'Savings Account', accountType: 'SAVINGS', openingBalance: '', bankName: '' },
  { name: 'Salary Account', accountType: 'CURRENT', openingBalance: '', bankName: '' },
  { name: 'Investment Account', accountType: 'INVESTMENT', openingBalance: '', bankName: '' },
  { name: 'Credit Card', accountType: 'CREDIT_CARD', openingBalance: '', bankName: '' },
];

const PRESET_CATEGORIES: WizardCategory[] = [
  { name: 'Salary', type: 'INCOME', description: 'Monthly salary income' },
  { name: 'Freelance', type: 'INCOME', description: 'Freelance and side project income' },
  { name: 'Investments', type: 'INCOME', description: 'Returns from investments' },
  {
    name: 'Food & Dining',
    type: 'EXPENSE',
    description: 'Groceries, restaurants, and food delivery',
  },
  {
    name: 'Transportation',
    type: 'EXPENSE',
    description: 'Fuel, public transport, and ride sharing',
  },
  { name: 'Rent & Housing', type: 'EXPENSE', description: 'Rent, maintenance, and utilities' },
  {
    name: 'Utilities',
    type: 'EXPENSE',
    description: 'Electricity, water, internet, and phone bills',
  },
  {
    name: 'Entertainment',
    type: 'EXPENSE',
    description: 'Movies, games, streaming services, and hobbies',
  },
  { name: 'Health & Fitness', type: 'EXPENSE', description: 'Medical, gym, and wellness expenses' },
  { name: 'Shopping', type: 'EXPENSE', description: 'Clothing, electronics, and general shopping' },
  { name: 'Education', type: 'EXPENSE', description: 'Courses, books, and learning materials' },
  { name: 'Travel', type: 'EXPENSE', description: 'Vacations, trips, and travel expenses' },
];

const PRESET_RECURRING: WizardRecurring[] = [];

const accountTypeOptions = [
  { value: 'SAVINGS', label: 'Savings Account', icon: PiggyBank },
  { value: 'CURRENT', label: 'Current Account', icon: Landmark },
  { value: 'INVESTMENT', label: 'Investment Account', icon: TrendingUp },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
];

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Wizard data states
  const [accounts, setAccounts] = useState<WizardAccount[]>(PRESET_ACCOUNTS.map((a) => ({ ...a })));
  const [categories, setCategories] = useState<WizardCategory[]>(
    PRESET_CATEGORIES.map((c) => ({ ...c })),
  );
  const [recurrings, setRecurrings] = useState<WizardRecurring[]>(
    PRESET_RECURRING.map((r) => ({ ...r })),
  );

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const updateAccount = useCallback((index: number, field: keyof WizardAccount, value: string) => {
    setAccounts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeAccount = useCallback((index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addAccount = useCallback(() => {
    setAccounts((prev) => [
      ...prev,
      { name: '', accountType: 'SAVINGS', openingBalance: '', bankName: '' },
    ]);
  }, []);

  const updateCategory = useCallback(
    (index: number, field: keyof WizardCategory, value: string) => {
      setCategories((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    [],
  );

  const removeCategory = useCallback((index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addCategory = useCallback(() => {
    setCategories((prev) => [...prev, { name: '', type: 'EXPENSE', description: '' }]);
  }, []);

  const updateRecurring = useCallback(
    (index: number, field: keyof WizardRecurring, value: string | number) => {
      setRecurrings((prev) => {
        const next = [...prev];
        const updated = { ...next[index], [field]: value };
        // Clear the opposite account field when type changes
        if (field === 'type') {
          if (value === 'EXPENSE') {
            updated.toAccountId = '';
          } else {
            updated.fromAccountId = '';
          }
        }
        next[index] = updated;
        return next;
      });
    },
    [],
  );

  const removeRecurring = useCallback((index: number) => {
    setRecurrings((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addRecurring = useCallback(() => {
    setRecurrings((prev) => [
      ...prev,
      {
        name: '',
        amount: '',
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        description: '',
        fromAccountId: '',
        toAccountId: '',
        categoryId: '',
      },
    ]);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create accounts first and capture their IDs
      const validAccounts = accounts.filter((a) => a.name.trim());
      console.log(`Creating ${validAccounts.length} accounts`);
      const accountResults = await Promise.allSettled(
        validAccounts.map((acc) =>
          accountAPI.create({
            name: acc.name,
            accountType: acc.accountType,
            openingBalance: parseFloat(acc.openingBalance) || 0,
            bankName: acc.bankName || undefined,
          }),
        ),
      );
      const createdAccountIds: number[] = [];
      accountResults.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          // Handle different API response shapes
          const res = r.value?.data;
          // Try multiple ways to extract the ID
          const accountId = res?.data?.id || res?.id || (res as any)?.data?.[0]?.id;
          const accName = validAccounts[idx].name;
          console.log(`Account ${accName}: API response=`, res, `extracted id=${accountId}`);
          if (accountId) {
            createdAccountIds.push(accountId);
          } else {
            console.warn(`Failed to extract account ID for ${accName}`);
          }
        } else if (r.status === 'rejected') {
          console.error(`Account creation failed for ${validAccounts[idx].name}:`, r.reason);
        }
      });
      console.log(`Created ${createdAccountIds.length} accounts: ${createdAccountIds.join(', ')}`);

      // If account creation failed, try fetching existing accounts as fallback
      if (createdAccountIds.length === 0 && validAccounts.length > 0) {
        try {
          console.log('No accounts created, fetching existing accounts as fallback');
          const accRes = await accountAPI.getAll(0, 100);
          const accData = accRes?.data?.data;
          const fetchedAccounts = accData?.content || accRes?.data?.data || accRes?.data || [];
          console.log('Fetched existing accounts:', fetchedAccounts);
          if (Array.isArray(fetchedAccounts) && fetchedAccounts.length > 0) {
            fetchedAccounts.slice(0, 1).forEach((acc: any) => {
              if (acc.id) {
                createdAccountIds.push(acc.id);
                console.log(`Added fallback account: ${acc.name} => id ${acc.id}`);
              }
            });
          }
        } catch (err) {
          console.error('Failed to fetch fallback accounts:', err);
        }
      }

      // Create categories - gracefully handle errors on remote backend
      // where categories may already exist (global UNIQUE constraint on name)
      const validCategories = categories.filter((c) => c.name.trim());
      const categoryResults = await Promise.allSettled(
        validCategories.map((cat) =>
          categoryAPI.create({
            name: cat.name,
            type: cat.type,
            description: cat.description || undefined,
          }),
        ),
      );

      // Extract created category IDs for linking to recurring transactions
      const categoryIdMap: Record<string, number> = {};
      categoryResults.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          const res = r.value?.data;
          // Try multiple ways to extract the ID from the response
          const categoryId = res?.data?.id || res?.id || (res as any)?.data?.[0]?.id;
          const catName = validCategories[idx].name;
          console.log(`Category ${catName}: API response=`, res, `extracted id=${categoryId}`);
          if (categoryId) {
            categoryIdMap[catName] = categoryId;
          } else {
            console.warn(`Failed to extract category ID for ${catName} from response:`, res);
          }
        } else if (r.status === 'rejected') {
          console.warn(`Category creation failed for ${validCategories[idx].name}:`, r.reason);
        }
      });
      console.log('Category ID Map after creation:', categoryIdMap);

      // If some categories failed, try fetching existing ones as fallback
      // This handles the case where the remote backend has the global UNIQUE(name) constraint
      // preventing us from creating categories with names that already exist
      const catFailedCount = categoryResults.filter((r) => r.status === 'rejected').length;
      if (catFailedCount > 0) {
        try {
          // Fetch existing categories to ensure they're available and extract IDs
          const catRes = await categoryAPI.getAll(0, 100);
          // Response structure: { data: { content: [...], totalElements: N }, message: "...", success: true }
          const pagedData = catRes?.data?.data;
          const fetchedCats = pagedData?.content || catRes?.data?.data || catRes?.data || [];
          console.log('Fetched categories from fallback:', fetchedCats);
          fetchedCats.forEach((cat: any) => {
            if (!categoryIdMap[cat.name]) {
              categoryIdMap[cat.name] = cat.id;
              console.log(`Added fallback category: ${cat.name} => id ${cat.id}`);
            }
          });
          console.log(`Fetched existing categories as fallback (${catFailedCount} creates failed)`);
          console.log('Updated Category ID Map:', categoryIdMap);
        } catch (err) {
          console.error('Failed to fetch fallback categories:', err);
        }
      }

      // Create recurring transactions with account references
      const validRecurrings = recurrings.filter(
        (r) =>
          r.name.trim() &&
          r.amount.trim() &&
          r.categoryId &&
          ((r.type === 'EXPENSE' && r.fromAccountId) || (r.type === 'INCOME' && r.toAccountId)),
      );
      console.log(
        `Found ${recurrings.length} recurring transactions, ${validRecurrings.length} are valid (name, amount, category, and account required)`,
      );
      validRecurrings.forEach((r, i) => {
        const accountLabel =
          r.type === 'EXPENSE' ? `From: ${r.fromAccountId}` : `To: ${r.toAccountId}`;
        console.log(
          `  ${i + 1}. ${r.name} - Amount: ${r.amount}, Type: ${r.type}, ${accountLabel}, Category: ${r.categoryId}`,
        );
      });

      // Use a future start date so the recurring job doesn't immediately try to
      // generate a transaction before the user has set up accounts properly
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDate = futureDate.toISOString().split('T')[0];

      // Build mapping from wizard IDs (1-based index) to actual created IDs
      const wizardAccountIdToRealId: Record<string, number> = {};
      validAccounts.forEach((acc, idx) => {
        const wizardId = String(idx + 1);
        if (idx < createdAccountIds.length) {
          wizardAccountIdToRealId[wizardId] = createdAccountIds[idx];
        }
      });
      console.log('Wizard Account ID Mapping:', wizardAccountIdToRealId);

      const wizardCategoryIdToRealId: Record<string, number> = {};
      validCategories.forEach((cat, idx) => {
        const wizardId = String(idx + 1);
        const realId = categoryIdMap[cat.name];
        if (realId) {
          wizardCategoryIdToRealId[wizardId] = realId;
        }
      });
      console.log('Wizard Category ID Mapping:', wizardCategoryIdToRealId);

      // Build recurring request using user-selected category and accounts
      const recurringResults = await Promise.allSettled(
        validRecurrings.map((rec) => {
          const payload: Record<string, any> = {
            name: rec.name,
            amount: parseFloat(rec.amount) || 0,
            type: rec.type,
            frequency: rec.frequency,
            dayOfMonth: rec.dayOfMonth,
            startDate,
          };
          if (rec.description) payload.description = rec.description;

          // Use user-selected category and map wizard ID to real category ID
          const realCategoryId = rec.categoryId
            ? wizardCategoryIdToRealId[rec.categoryId]
            : undefined;
          if (realCategoryId) {
            payload.categoryId = realCategoryId;
            console.log(
              `Recurring "${rec.name}": categoryId=${realCategoryId} (wizard: ${rec.categoryId})`,
            );
          } else {
            console.warn(
              `Recurring "${rec.name}": No category mapped for wizard ID ${rec.categoryId}`,
            );
          }

          // Use user-selected account and map wizard ID to real account ID
          if (rec.type === 'EXPENSE' && rec.fromAccountId) {
            const realAccountId = wizardAccountIdToRealId[rec.fromAccountId];
            if (realAccountId) {
              payload.fromAccountId = realAccountId;
              console.log(
                `  -> EXPENSE: fromAccountId=${realAccountId} (wizard: ${rec.fromAccountId})`,
              );
            } else {
              console.warn(`  -> EXPENSE: No account mapped for wizard ID ${rec.fromAccountId}`);
            }
          } else if (rec.type === 'INCOME' && rec.toAccountId) {
            const realAccountId = wizardAccountIdToRealId[rec.toAccountId];
            if (realAccountId) {
              payload.toAccountId = realAccountId;
              console.log(`  -> INCOME: toAccountId=${realAccountId} (wizard: ${rec.toAccountId})`);
            } else {
              console.warn(`  -> INCOME: No account mapped for wizard ID ${rec.toAccountId}`);
            }
          }

          console.log(`Recurring transaction payload:`, payload);
          return recurringTransactionAPI.create(payload as any);
        }),
      );

      // Log individual failures for debugging
      [...accountResults, ...categoryResults, ...recurringResults].forEach((r, i) => {
        if (r.status === 'rejected') {
          const errorData = r.reason?.response?.data || r.reason;
          console.error(`Setup wizard item ${i} failed:`, errorData);
          console.error(`  Full error:`, r.reason);
        }
      });

      // Count successes
      const accountSuccess = accountResults.filter((r) => r.status === 'fulfilled').length;

      // Count category successes, treating UNIQUE constraint violations as "already exists" success
      let categorySuccess = 0;
      categoryResults.forEach((r) => {
        if (r.status === 'fulfilled') {
          categorySuccess++;
        } else if (r.status === 'rejected') {
          const errStr = JSON.stringify(r.reason?.response?.data || r.reason || '').toLowerCase();
          // Hibernate constraint violation: "duplicate key value violates unique constraint"
          if (
            errStr.includes('unique constraint') ||
            errStr.includes('already exists') ||
            errStr.includes('duplicate key')
          ) {
            categorySuccess++; // Category already globally seeded - treat as available
          }
        }
      });

      // Count recurring successes
      const recurringSuccess = recurringResults.filter((r) => r.status === 'fulfilled').length;
      console.log(
        `Setup wizard completion stats: Accounts=${accountSuccess}, Categories=${categorySuccess}, Recurring=${recurringSuccess}`,
      );
      console.log(
        `  categoryIdMap has ${Object.keys(categoryIdMap).length} entries: ${JSON.stringify(categoryIdMap)}`,
      );
      console.log(`  wizardAccountIdToRealId: ${JSON.stringify(wizardAccountIdToRealId)}`);

      // Check if we have the minimum viable setup
      const hasAccounts = accountSuccess > 0 && createdAccountIds.length > 0;
      // As long as accounts were created with IDs, the setup is complete.
      // Categories may fail on remote backend due to global UNIQUE(name) constraint
      // (before V10 migration is applied), and recurring needs accounts to be linked.
      if (hasAccounts) {
        console.log(`Setup complete: Accounts=${accountSuccess}, Recurring=${recurringSuccess}`);
        if (recurringSuccess === 0 && validRecurrings.length > 0) {
          console.warn(
            'Warning: Recurring transactions failed to create, but setup wizard completes as accounts exist',
          );
        }
        setCompleted(true);
        window.setTimeout(() => onComplete(), 1200);
      } else {
        // Collect account-specific errors
        const errors: string[] = [];
        accountResults.forEach((r) => {
          if (r.status === 'rejected') {
            const msg = r.reason?.response?.data?.message || r.reason?.message || '';
            if (msg && !errors.includes(msg)) errors.push(msg);
          }
        });
        console.error(
          `Setup failed: No valid account IDs extracted. createdAccountIds=${JSON.stringify(createdAccountIds)}`,
        );
        setError(
          errors.length > 0 ? errors.join('; ') : 'Failed to save accounts. Please try again.',
        );
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong during setup. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return accounts.some((a) => a.name.trim());
      case 2:
        return categories.some((c) => c.name.trim());
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepIcons = [
    <Sparkles key="welcome" className="w-5 h-5" />,
    <Wallet key="accounts" className="w-5 h-5" />,
    <Tags key="categories" className="w-5 h-5" />,
    <Repeat key="recurring" className="w-5 h-5" />,
    <Check key="complete" className="w-5 h-5" />,
  ];

  const handleContinue = () => {
    setError(null);
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-neon-purple/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-neon-cyan/10 blur-[100px] pointer-events-none" />

        {/* Main card */}
        <div
          className="relative card p-6 border-white/10 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Header with step indicators - fixed */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neon-cyan/10">
                <Sparkles className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white">Setup Wizard</h2>
                <p className="text-[10px] text-white/40">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          </div>

          {/* Step progress bar */}
          <div className="flex gap-1 mb-4 shrink-0">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  i <= currentStep
                    ? 'bg-neon-cyan shadow-[0_0_6px_rgba(0,245,255,0.4)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-4 mb-4 shrink-0">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    i === currentStep
                      ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                      : i < currentStep
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'bg-white/5 text-white/20'
                  }`}
                >
                  {stepIcons[i]}
                </div>
                <span
                  className={`text-[9px] font-medium tracking-wider uppercase ${
                    i === currentStep
                      ? 'text-neon-cyan'
                      : i < currentStep
                        ? 'text-neon-cyan/60'
                        : 'text-white/20'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 shrink-0 flex items-start gap-2 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scrollable content area */}
          <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && <WelcomeStep />}
                {currentStep === 1 && (
                  <AccountsStep
                    accounts={accounts}
                    onUpdate={updateAccount}
                    onRemove={removeAccount}
                    onAdd={addAccount}
                  />
                )}
                {currentStep === 2 && (
                  <CategoriesStep
                    categories={categories}
                    onUpdate={updateCategory}
                    onRemove={removeCategory}
                    onAdd={addCategory}
                  />
                )}
                {currentStep === 3 && (
                  <RecurringStep
                    recurrings={recurrings}
                    onUpdate={updateRecurring}
                    onRemove={removeRecurring}
                    onAdd={addRecurring}
                    createdAccounts={accounts
                      .filter((a) => a.name.trim())
                      .map((a, idx) => ({ id: idx + 1, name: a.name }))}
                    createdCategories={categories
                      .filter((c) => c.name.trim())
                      .map((c, idx) => ({ id: idx + 1, name: c.name, type: c.type }))}
                  />
                )}
                {currentStep === 4 && (
                  <CompleteStep loading={loading} completed={completed} error={error} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons - fixed */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => {
                setError(null);
                setCurrentStep((p) => Math.max(0, p - 1));
              }}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleContinue}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-bg-deep bg-neon-cyan rounded-xl hover:bg-neon-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || completed}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-bg-deep bg-neon-cyan rounded-xl hover:bg-neon-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg-deep" />
                      Setting up...
                    </>
                  ) : completed ? (
                    <>
                      <Check className="w-4 h-4" />
                      Done!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Step 1: Welcome ── */
const WelcomeStep: React.FC = () => (
  <div className="text-center py-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center"
    >
      <Sparkles className="w-8 h-8 text-neon-cyan" />
    </motion.div>
    <h3 className="text-xl font-display font-bold text-white mb-2">Welcome to Expense Manager</h3>
    <p className="text-white/50 max-w-md mx-auto mb-4 leading-relaxed text-sm">
      Let's get you set up in just a few steps. We'll help you create your accounts, add some
      spending categories, and set up recurring transactions so you can start tracking your finances
      right away.
    </p>
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {[
        { icon: Wallet, label: 'Accounts', desc: 'Link your accounts' },
        { icon: Tags, label: 'Categories', desc: 'Organize spending' },
        { icon: Repeat, label: 'Recurring', desc: 'Auto-track bills' },
      ].map((item) => (
        <div
          key={item.label}
          className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center"
        >
          <item.icon className="w-5 h-5 mx-auto mb-1.5 text-neon-cyan" />
          <p className="text-sm font-medium text-white/80">{item.label}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ── Step 2: Accounts ── */
interface AccountsStepProps {
  accounts: WizardAccount[];
  onUpdate: (index: number, field: keyof WizardAccount, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

const AccountsStep: React.FC<AccountsStepProps> = ({ accounts, onUpdate, onRemove, onAdd }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-display font-bold text-white">Create Accounts</h3>
        <p className="text-[11px] text-white/40">Set up your financial accounts</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>

    <div className="space-y-2">
      {accounts.map((acc, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-white/5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-neon-cyan/10">
                <Wallet className="w-3.5 h-3.5 text-neon-cyan" />
              </div>
              <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                Account {i + 1}
              </span>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="p-1 rounded-lg hover:bg-neon-pink/10 text-white/20 hover:text-neon-pink transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={acc.name}
              onChange={(e) => onUpdate(i, 'name', e.target.value)}
              placeholder="Account name"
              className="col-span-2 sm:col-span-1 px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
            <select
              value={acc.accountType}
              onChange={(e) => onUpdate(i, 'accountType', e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            >
              {accountTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={acc.openingBalance}
              onChange={(e) => onUpdate(i, 'openingBalance', e.target.value)}
              placeholder="Balance"
              className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={acc.bankName}
              onChange={(e) => onUpdate(i, 'bankName', e.target.value)}
              placeholder="Bank (opt)"
              className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ── Step 3: Categories ── */
interface CategoriesStepProps {
  categories: WizardCategory[];
  onUpdate: (index: number, field: keyof WizardCategory, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

const CategoriesStep: React.FC<CategoriesStepProps> = ({
  categories,
  onUpdate,
  onRemove,
  onAdd,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-display font-bold text-white">Create Categories</h3>
        <p className="text-[11px] text-white/40">Organize your transactions</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>

    <div className="space-y-1.5">
      {categories.map((cat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2"
        >
          <div
            className={`p-1 rounded-lg shrink-0 ${
              cat.type === 'INCOME' ? 'bg-neon-cyan/10' : 'bg-neon-pink/10'
            }`}
          >
            <Tags
              className={`w-3 h-3 ${cat.type === 'INCOME' ? 'text-neon-cyan' : 'text-neon-pink'}`}
            />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-1.5">
            <input
              type="text"
              value={cat.name}
              onChange={(e) => onUpdate(i, 'name', e.target.value)}
              placeholder="Category name"
              className="col-span-2 px-2 py-1 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
            <select
              value={cat.type}
              onChange={(e) => onUpdate(i, 'type', e.target.value)}
              className="px-2 py-1 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <input
              type="text"
              value={cat.description}
              onChange={(e) => onUpdate(i, 'description', e.target.value)}
              placeholder="Description (opt)"
              className="px-2 py-1 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => onRemove(i)}
            className="p-1 rounded-lg hover:bg-neon-pink/10 text-white/20 hover:text-neon-pink transition-colors shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ── Step 4: Recurring ── */
interface RecurringStepProps {
  recurrings: WizardRecurring[];
  onUpdate: (index: number, field: keyof WizardRecurring, value: string | number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  createdAccounts: Array<{ id: number; name: string }>;
  createdCategories: Array<{ id: number; name: string; type: string }>;
}

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const RecurringStep: React.FC<RecurringStepProps> = ({
  recurrings,
  onUpdate,
  onRemove,
  onAdd,
  createdAccounts,
  createdCategories,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-display font-bold text-white">Recurring Transactions</h3>
        <p className="text-[11px] text-white/40">Add bills and income that repeat (optional)</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>

    {recurrings.length === 0 ? (
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p className="text-xs text-white/50">No recurring transactions added yet.</p>
        <p className="text-xs text-white/40 mt-1">
          Click <span className="text-neon-cyan">Add</span> to add one, or skip to continue.
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        {recurrings.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl bg-white/5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-neon-purple/10">
                  <Repeat className="w-3.5 h-3.5 text-neon-purple" />
                </div>
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                  Recurring {i + 1}
                </span>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="p-1 rounded-lg hover:bg-neon-pink/10 text-white/20 hover:text-neon-pink transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {/* First row: Name, Amount, Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={rec.name}
                  onChange={(e) => onUpdate(i, 'name', e.target.value)}
                  placeholder="Name *"
                  className="col-span-2 px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
                <input
                  type="number"
                  value={rec.amount}
                  onChange={(e) => onUpdate(i, 'amount', e.target.value)}
                  placeholder="Amount *"
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
                <select
                  value={rec.type}
                  onChange={(e) => onUpdate(i, 'type', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              {/* Second row: Account (From/To based on type), Category */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select
                  value={rec.type === 'EXPENSE' ? rec.fromAccountId || '' : rec.toAccountId || ''}
                  onChange={(e) => {
                    if (rec.type === 'EXPENSE') {
                      onUpdate(i, 'fromAccountId', e.target.value);
                    } else {
                      onUpdate(i, 'toAccountId', e.target.value);
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                >
                  <option value="">
                    {rec.type === 'EXPENSE' ? 'From Account *' : 'To Account *'}
                  </option>
                  {createdAccounts.map((acc) => (
                    <option key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </option>
                  ))}
                </select>
                <select
                  value={rec.categoryId || ''}
                  onChange={(e) => onUpdate(i, 'categoryId', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                >
                  <option value="">Category *</option>
                  {createdCategories
                    .filter((cat) => cat.type === rec.type)
                    .map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Third row: Frequency, Day, Description */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select
                  value={rec.frequency}
                  onChange={(e) => onUpdate(i, 'frequency', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={rec.dayOfMonth}
                  onChange={(e) => onUpdate(i, 'dayOfMonth', parseInt(e.target.value) || 1)}
                  min={1}
                  max={31}
                  placeholder="Day"
                  className="px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  value={rec.description}
                  onChange={(e) => onUpdate(i, 'description', e.target.value)}
                  placeholder="Description (opt)"
                  className="col-span-2 sm:col-span-1 px-2.5 py-1.5 text-xs bg-bg-deep border border-white/10 rounded-lg text-white/80 placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

/* ── Step 5: Complete ── */
interface CompleteStepProps {
  loading: boolean;
  completed: boolean;
  error: string | null;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ loading, completed, error }) => {
  if (completed) {
    return (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-neon-cyan" />
        </motion.div>
        <h3 className="text-xl font-display font-bold text-white mb-2">All Set!</h3>
        <p className="text-white/50 max-w-md mx-auto text-sm">
          Your workspace is ready. Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neon-pink/10 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-neon-pink" />
        </motion.div>
        <h3 className="text-xl font-display font-bold text-white mb-2">Setup Failed</h3>
        <p className="text-neon-pink/70 max-w-md mx-auto text-sm">{error}</p>
        <p className="text-white/30 text-xs mt-3">
          Please check your data and try again, or skip this setup for now.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center"
      >
        <Sparkles className="w-8 h-8 text-neon-cyan" />
      </motion.div>
      <h3 className="text-xl font-display font-bold text-white mb-2">Ready to Launch</h3>
      <p className="text-white/50 max-w-md mx-auto mb-4 text-sm leading-relaxed">
        You've configured your accounts, categories, and recurring transactions. Click
        <strong className="text-white/80"> Complete Setup </strong>
        to save everything and start using Expense Manager!
      </p>

      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xl font-display font-bold text-neon-cyan">✓</p>
          <p className="text-xs text-white/40 mt-1">Accounts</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xl font-display font-bold text-neon-cyan">✓</p>
          <p className="text-xs text-white/40 mt-1">Categories</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xl font-display font-bold text-neon-cyan">✓</p>
          <p className="text-xs text-white/40 mt-1">Recurring</p>
        </div>
      </div>

      <p className="text-xs text-white/20">
        You can always modify these later from the sidebar menu.
      </p>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-cyan" />
          <span className="text-xs text-white/50">Creating your workspace...</span>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
