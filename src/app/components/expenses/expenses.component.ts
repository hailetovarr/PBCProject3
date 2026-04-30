// add to this file
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService, Expense } from '../../services/budget.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="expenses-container">
      <h1 class="mb-4">
        <i class="fas fa-minus-circle"></i> Manage Expenses
      </h1>

      <div class="grid grid-2">
        <div class="card">
          <h3 class="mb-3">
            <i class="fas fa-plus"></i> Add New Expense
          </h3>
          <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="description">Description</label>
              <input
                type="text"
                id="description"
                class="form-control"
                formControlName="description"
                placeholder="e.g., Grocery shopping, Gas, Movie tickets"
                [class.error]="isFieldInvalid('description')"
              />
              <div *ngIf="isFieldInvalid('description')" class="error-message">
                Description is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                class="form-control"
                formControlName="amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                [class.error]="isFieldInvalid('amount')"
              />
              <div *ngIf="isFieldInvalid('amount')" class="error-message">
                <span *ngIf="expenseForm.get('amount')?.errors?.['required']">
                  Amount is required
                </span>
                <span *ngIf="expenseForm.get('amount')?.errors?.['min']">
                  Amount must be greater than 0
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="category">Category</label>
              <select
                id="category"
                class="form-control"
                formControlName="category"
                [class.error]="isFieldInvalid('category')"
              >
                <option value="">Select a category</option>
                <option *ngFor="let category of categories" [value]="category">
                  {{ category }}
                </option>
              </select>
              <div *ngIf="isFieldInvalid('category')" class="error-message">
                Category is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="date">Date</label>
              <input
                type="date"
                id="date"
                class="form-control"
                formControlName="date"
                [class.error]="isFieldInvalid('date')"
              />
              <div *ngIf="isFieldInvalid('date')" class="error-message">
                Date is required
              </div>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="expenseForm.invalid || isSubmitting"
            >
              <i class="fas fa-plus"></i>
              {{ isSubmitting ? 'Adding...' : 'Add Expense' }}
            </button>
          </form>
        </div>

        <div class="card">
          <div class="expenses-header">
            <h3 class="mb-3">
              <i class="fas fa-list"></i> Expense History
            </h3>
            <div class="filter-controls">
              <select class="form-control filter-select" [(ngModel)]="selectedCategoryFilter" (ngModelChange)="filterExpenses()">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div *ngIf="filteredExpenses.length > 0; else noExpenses">
            <div *ngFor="let expense of filteredExpenses" class="expense-item">
              <div class="expense-info">
                <div class="expense-description">{{ expense.description }}</div>
                <div class="expense-meta">
                  <span class="expense-category" [ngClass]="getCategoryClass(expense.category)">
                    {{ expense.category }}
                  </span>
                  <span class="expense-date">{{ expense.date | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="expense-actions">
                <span class="expense-amount">\${{ expense.amount | number:'1.2-2' }}</span>
                <button 
                  class="btn-icon btn-danger"
                  (click)="deleteExpense(expense.id)"
                  title="Delete expense"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="expense-total">
              <strong>
                Total {{ selectedCategoryFilter ? selectedCategoryFilter + ' ' : '' }}Expenses: 
                \${{ getTotalExpenses() | number:'1.2-2' }}
              </strong>
            </div>
          </div>
          <ng-template #noExpenses>
            <div class="empty-state">
              <i class="fas fa-receipt"></i>
              <p>{{ selectedCategoryFilter ? 'No expenses in this category' : 'No expenses recorded yet' }}</p>
              <p class="text-muted">
                {{ selectedCategoryFilter ? 'Try selecting a different category or add a new expense.' : 'Add your first expense to start tracking!' }}
              </p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Category Summary -->
      <div class="card mt-4" *ngIf="expenseList.length > 0">
        <h3 class="mb-3">
          <i class="fas fa-chart-bar"></i> Expenses by Category
        </h3>
        <div class="category-summary">
          <div *ngFor="let category of getExpenseCategories()" class="category-summary-item">
            <div class="category-info">
              <span class="expense-category" [ngClass]="getCategoryClass(category)">
                {{ category }}
              </span>
              <span class="category-count">{{ getCategoryCount(category) }} expense(s)</span>
            </div>
            <div class="category-amount">
              \${{ getCategoryTotal(category) | number:'1.2-2' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" class="alert alert-success mt-3">
        <i class="fas fa-check-circle"></i>
        Expense added successfully!
      </div>
    </div>
  `,
  styles: [`
    .expenses-container h1 {
      color: #02318a;
      font-weight: 700;
      text-align: center;
    }

    .expenses-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filter-controls {
      min-width: 200px;
    }

    .filter-select {
      font-size: 0.875rem;
      padding: 8px 12px;
    }

    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .expense-item:last-child {
      border-bottom: none;
    }

    .expense-info {
      flex: 1;
    }

    .expense-description {
      font-weight: 500;
      margin-bottom: 8px;
      color: #333;
    }

    .expense-meta {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .expense-date {
      font-size: 0.875rem;
      color: #666;
    }

    .expense-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .expense-amount {
      font-weight: 600;
      color: #ff416c;
      font-size: 1.1rem;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      transform: scale(1.1);
    }

    .btn-danger {
      color: #ff416c;
    }

    .btn-danger:hover {
      background: #fff5f5;
    }

    .expense-total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: right;
      font-size: 1.2rem;
      color: #ff416c;
    }

    .category-summary {
      display: grid;
      gap: 12px;
    }

    .category-summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .category-summary-item:last-child {
      border-bottom: none;
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-count {
      font-size: 0.875rem;
      color: #666;
    }

    .category-amount {
      font-weight: 600;
      color: #667eea;
      font-size: 1.1rem;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 16px;
      color: #ddd;
    }

    .empty-state p {
      margin-bottom: 8px;
    }

    .text-muted {
      color: #999 !important;
      font-size: 0.875rem;
    }

    .alert {
      padding: 16px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .alert-success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .alert i {
      margin-right: 8px;
    }

    .form-control:disabled {
      background-color: #f8f9fa;
      opacity: 0.6;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .expenses-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .expense-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenseForm: FormGroup;
  expenseList: Expense[] = [];
  filteredExpenses: Expense[] = [];
  categories: string[] = [];
  selectedCategoryFilter = '';
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.categories = this.budgetService.categories;
    this.loadExpenses();
  }

  private loadExpenses(): void {
    this.budgetService.expenses$.subscribe(expenses => {
      this.expenseList = expenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.filterExpenses();
    });
  }

  filterExpenses(): void {
    if (this.selectedCategoryFilter) {
      this.filteredExpenses = this.expenseList.filter(
        expense => expense.category === this.selectedCategoryFilter
      );
    } else {
      this.filteredExpenses = [...this.expenseList];
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.expenseForm.value;
      const newExpense = {
        description: formValue.description.trim(),
        amount: parseFloat(formValue.amount),
        category: formValue.category,
        date: new Date(formValue.date)
      };

      this.budgetService.addExpense(newExpense);
      
      // Reset form and show success message
      this.expenseForm.reset({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      this.showSuccessMessage = true;
      this.isSubmitting = false;

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.budgetService.deleteExpense(id);
    }
  }

  getTotalExpenses(): number {
    return this.filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getExpenseCategories(): string[] {
    const categoriesWithExpenses = [...new Set(this.expenseList.map(expense => expense.category))];
    return categoriesWithExpenses.sort();
  }

  getCategoryTotal(category: string): number {
    return this.expenseList
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  }

  getCategoryCount(category: string): number {
    return this.expenseList.filter(expense => expense.category === category).length;
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}