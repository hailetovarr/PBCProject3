import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: Date;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  expensesByCategory: { [category: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private incomeSubject = new BehaviorSubject<Income[]>([]);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  public income$ = this.incomeSubject.asObservable();
  public expenses$ = this.expensesSubject.asObservable();

  public categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Shopping',
    'Education',
    'Other'
  ];

  constructor() {
    this.loadData();
  }

  // Income methods
  addIncome(income: Omit<Income, 'id'>): void {
    const newIncome: Income = {
      ...income,
      id: this.generateId(),
      date: new Date(income.date)
    };
    
    const currentIncome = this.incomeSubject.value;
    this.incomeSubject.next([...currentIncome, newIncome]);
    this.saveData();
  }

  updateIncome(id: string, updatedIncome: Partial<Income>): void {
    const currentIncome = this.incomeSubject.value;
    const index = currentIncome.findIndex(income => income.id === id);
    
    if (index !== -1) {
      currentIncome[index] = { ...currentIncome[index], ...updatedIncome };
      this.incomeSubject.next([...currentIncome]);
      this.saveData();
    }
  }

  deleteIncome(id: string): void {
    const currentIncome = this.incomeSubject.value;
    const filteredIncome = currentIncome.filter(income => income.id !== id);
    this.incomeSubject.next(filteredIncome);
    this.saveData();
  }

  // Expense methods
  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      date: new Date(expense.date)
    };
    
    const currentExpenses = this.expensesSubject.value;
    this.expensesSubject.next([...currentExpenses, newExpense]);
    this.saveData();
  }

  updateExpense(id: string, updatedExpense: Partial<Expense>): void {
    const currentExpenses = this.expensesSubject.value;
    const index = currentExpenses.findIndex(expense => expense.id === id);
    
    if (index !== -1) {
      currentExpenses[index] = { ...currentExpenses[index], ...updatedExpense };
      this.expensesSubject.next([...currentExpenses]);
      this.saveData();
    }
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expensesSubject.value;
    const filteredExpenses = currentExpenses.filter(expense => expense.id !== id);
    this.expensesSubject.next(filteredExpenses);
    this.saveData();
  }

  // Summary methods
  getBudgetSummary(): Observable<BudgetSummary> {
    return new Observable(observer => {
      const income = this.incomeSubject.value;
      const expenses = this.expensesSubject.value;

      const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const remainingBudget = totalIncome - totalExpenses;

      const expensesByCategory: { [category: string]: number } = {};
      expenses.forEach(expense => {
        expensesByCategory[expense.category] = 
          (expensesByCategory[expense.category] || 0) + expense.amount;
      });

      observer.next({
        totalIncome,
        totalExpenses,
        remainingBudget,
        expensesByCategory
      });
    });
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveData(): void {
    try {
      localStorage.setItem('budget-tracker-income', JSON.stringify(this.incomeSubject.value));
      localStorage.setItem('budget-tracker-expenses', JSON.stringify(this.expensesSubject.value));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  private loadData(): void {
    try {
      const savedIncome = localStorage.getItem('budget-tracker-income');
      const savedExpenses = localStorage.getItem('budget-tracker-expenses');

      if (savedIncome) {
        const income = JSON.parse(savedIncome).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        this.incomeSubject.next(income);
      }

      if (savedExpenses) {
        const expenses = JSON.parse(savedExpenses).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        this.expensesSubject.next(expenses);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.incomeSubject.next([]);
    this.expensesSubject.next([]);
    localStorage.removeItem('budget-tracker-income');
    localStorage.removeItem('budget-tracker-expenses');
  }
}
