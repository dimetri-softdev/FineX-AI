import {
  getMonthDateRange,
  getMonthlySpending,
  summarizeTransactions,
} from "./finance";

describe("summarizeTransactions", () => {
  it("calculates income, expenses, and net balance from transaction types", () => {
    const totals = summarizeTransactions([
      { amount: 1250, type: "income", date: "2024-01-05T12:00:00.000Z" },
      { amount: 75.5, type: "expense", date: "2024-01-10T12:00:00.000Z" },
      { amount: 300, type: "income", date: "2024-01-20T12:00:00.000Z" },
    ]);

    expect(totals).toEqual({ income: 1550, expenses: 75.5 });
    expect(totals.income - totals.expenses).toBe(1474.5);
  });
});

describe("getMonthDateRange", () => {
  it("returns inclusive start and exclusive next-month boundaries", () => {
    const date = new Date(2024, 1, 15, 13);
    const range = getMonthDateRange(date);

    expect(range.start).toBe(new Date(2024, 1, 1).toISOString());
    expect(range.end).toBe(new Date(2024, 2, 1).toISOString());
  });
});

describe("getMonthlySpending", () => {
  it("includes expenses only and returns the requested trailing months", () => {
    const result = getMonthlySpending(
      [
        { amount: 50, type: "expense", date: new Date(2024, 0, 10).toISOString() },
        { amount: 500, type: "income", date: new Date(2024, 0, 12).toISOString() },
        { amount: 20, type: "expense", date: new Date(2024, 1, 2).toISOString() },
        { amount: 90, type: "expense", date: new Date(2023, 11, 31).toISOString() },
      ],
      new Date(2024, 1, 15),
      2,
    );

    expect(result).toHaveLength(2);
    expect(result.map((month) => month.total)).toEqual([50, 20]);
  });
});
