// update this file
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService, BudgetSummary, Income, Expense } from '../../services/budget.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-container">
      <h1 class="mb-4">
        <i class="fas fa-chart-pie"></i> Budget Summary
      </h1>

      <div class="grid grid-3 mb-4">
        <div class="card text-center">
          <h3 class="text-success mb-2">
            <i class="fas fa-arrow-up"></i> Total Income
          </h3>
          <p class="amount text-success">\${{ summary?.totalIncome | number:'1.2-2' }}</p>
        </div>

        <div class="card text-center">
          <h3 class="text-danger mb-2">
            <i class="fas fa-arrow-down"></i> Total Expenses
          </h3>
          <p class="amount text-danger">\${{ summary?.totalExpenses | number:'1.2-2' }}</p>
        </div>

        <div class="card text-center">
          <h3 class="mb-2" [ngClass]="{
            'text-success': (summary?.remainingBudget || 0) >= 0,
            'text-danger': (summary?.remainingBudget || 0) < 0
          }">
            <i class="fas fa-wallet"></i> Remaining Budget
          </h3>
          <p class="amount" [ngClass]="{
            'text-success': (summary?.remainingBudget || 0) >= 0,
            'text-danger': (summary?.remainingBudget || 0) < 0
          }">\${{ summary?.remainingBudget | number:'1.2-2' }}</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3 class="mb-3">
            <i class="fas fa-tags"></i> Expenses by Category
          </h3>
          <div *ngIf="summary?.expensesByCategory && getCategories().length > 0; else noExpenses">
            <div *ngFor="let category of getCategories()" class="expense-category-item">
              <div class="category-info">
                <span class="category-name">{{ category }}</span>
                <span class="expense-category" [ngClass]="getCategoryClass(category)">
                  {{ category }}
                </span>
              </div>
              <div class="category-amount">
                \${{ getCategoryAmount(category) | number:'1.2-2' }}
              </div>
            </div>
          </div>
          <ng-template #noExpenses>
            <p class="text-center" style="color: #666; font-style: italic;">
              No expenses recorded yet
            </p>
          </ng-template>
        </div>

        <div class="card">
          <h3 class="mb-3">
            <i class="fas fa-history"></i> Recent Transactions
          </h3>
          <div *ngIf="recentTransactions.length > 0; else noTransactions">
            <div *ngFor="let transaction of recentTransactions" class="transaction-item">
              <div class="transaction-info">
                <div class="transaction-description">{{ transaction.description }}</div>
                <div class="transaction-date">{{ transaction.date | date:'short' }}</div>
              </div>
              <div class="transaction-amount" [ngClass]="{
                'text-success': transaction.type === 'income',
                'text-danger': transaction.type === 'expense'
              }">
                {{ transaction.type === 'income' ? '+' : '-' }}\${{ transaction.amount | number:'1.2-2' }}
              </div>
            </div>
          </div>
          <ng-template #noTransactions>
            <p class="text-center" style="color: #666; font-style: italic;">
              No transactions recorded yet
            </p>
          </ng-template>
        </div>
      </div>

      <div class="card mt-4" *ngIf="(summary?.remainingBudget || 0) < 0">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Budget Alert:</strong> You have exceeded your budget by 
          \${{ Math.abs(summary?.remainingBudget || 0) | number:'1.2-2' }}. 
          Consider reviewing your expenses.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-container h1 {
      color: #667eea;
      font-weight: 700;
      text-align: center;
    }

    .amount {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .expense-category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .expense-category-item:last-child {
      border-bottom: none;
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-name {
      font-weight: 500;
    }

    .category-amount {
      font-weight: 600;
      color: #667eea;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-info {
      flex: 1;
    }

    .transaction-description {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .transaction-date {
      font-size: 0.875rem;
      color: #666;
    }

    .transaction-amount {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .alert {
      padding: 16px;
      border-radius: 8px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }

    .alert i {
      margin-right: 8px;
    }

    .alert-warning {
      background: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }
  `]
})
export class SummaryComponent implements OnInit {
  summary: BudgetSummary | null = null;
  recentTransactions: any[] = [];
  Math = Math;

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadRecentTransactions();
  }

  private loadSummary(): void {
    this.budgetService.getBudgetSummary().subscribe(summary => {
      this.summary = summary;
    });
  }

  private loadRecentTransactions(): void {
    const allTransactions: any[] = [];

    this.budgetService.income$.subscribe(income => {
      const incomeTransactions = income.map(item => ({
        ...item,
        type: 'income',
        description: item.source
      }));
      allTransactions.push(...incomeTransactions);
      this.updateRecentTransactions(allTransactions);
    });

    this.budgetService.expenses$.subscribe(expenses => {
      const expenseTransactions = expenses.map(item => ({
        ...item,
        type: 'expense'
      }));
      
      // Clear previous expense transactions and add new ones
      const incomeTransactions = allTransactions.filter(t => t.type === 'income');
      allTransactions.length = 0;
      allTransactions.push(...incomeTransactions, ...expenseTransactions);
      this.updateRecentTransactions(allTransactions);
    });
  }

  private updateRecentTransactions(transactions: any[]): void {
    this.recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  getCategories(): string[] {
    if (!this.summary?.expensesByCategory) return [];
    return Object.keys(this.summary.expensesByCategory);
  }

  getCategoryClass(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Food & Dining': 'category-food',
      'Transportation': 'category-transport',
      'Entertainment': 'category-entertainment',
      'Utilities': 'category-utilities',
      'Healthcare': 'category-healthcare',
      'Shopping': 'category-other',
      'Education': 'category-other',
      'Other': 'category-other'
    };
    return categoryMap[category] || 'category-other';
  }

  getCategoryAmount(category: string): number {
    return this.summary?.expensesByCategory?.[category] || 0;
  }
}