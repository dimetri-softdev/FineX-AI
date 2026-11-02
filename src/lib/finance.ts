export interface FinancialTransaction {
  amount: number;
  type: "income" | "expense";
  date: string;
}

export interface MonthlySpendingPoint {
  label: string;
  total: number;
}

export const summarizeTransactions = (transactions: FinancialTransaction[]) =>
  transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        totals.income += transaction.amount;
      } else {
        totals.expenses += transaction.amount;
      }

      return totals;
    },
    { income: 0, expenses: 0 },
  );

export const getMonthDateRange = (date: Date) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
  end: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString(),
});

export const getMonthlySpending = (
  transactions: FinancialTransaction[],
  currentDate: Date,
  monthCount = 6,
): MonthlySpendingPoint[] => {
  const months: MonthlySpendingPoint[] = [];

  for (let offset = monthCount - 1; offset >= 0; offset--) {
    const month = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - offset,
      1,
    );
    const total = transactions.reduce((sum, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (
        transaction.type === "expense" &&
        transactionDate.getFullYear() === month.getFullYear() &&
        transactionDate.getMonth() === month.getMonth()
      ) {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    months.push({
      label: month.toLocaleString("default", { month: "short" }),
      total,
    });
  }

  return months;
};
