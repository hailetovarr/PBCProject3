import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService, Income } from '../../services/budget.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="income-container">
      <h1 class="mb-4">
        <i class="fas fa-plus-circle"></i> Manage Income
      </h1>

      <div class="grid grid-2">
        <div class="card">
          <h3 class="mb-3">
            <i class="fas fa-plus"></i> Add New Income
          </h3>
          <form [formGroup]="incomeForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="source">Income Source</label>
              <input
                type="text"
                id="source"
                class="form-control"
                formControlName="source"
                placeholder="e.g., Salary, Freelance, Investment"
                [class.error]="isFieldInvalid('source')"
              />
              <div *ngIf="isFieldInvalid('source')" class="error-message">
                Income source is required
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
                <span *ngIf="incomeForm.get('amount')?.errors?.['required']">
                  Amount is required
                </span>
                <span *ngIf="incomeForm.get('amount')?.errors?.['min']">
                  Amount must be greater than 0
                </span>
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
              [disabled]="incomeForm.invalid || isSubmitting"
            >
              <i class="fas fa-plus"></i>
              {{ isSubmitting ? 'Adding...' : 'Add Income' }}
            </button>
          </form>
        </div>

        <div class="card">
          <h3 class="mb-3">
            <i class="fas fa-list"></i> Income History
          </h3>
          <div *ngIf="incomeList.length > 0; else noIncome">
            <div *ngFor="let income of incomeList" class="income-item">
              <div class="income-info">
                <div class="income-source">{{ income.source }}</div>
                <div class="income-date">{{ income.date | date:'mediumDate' }}</div>
              </div>
              <div class="income-actions">
                <span class="income-amount">\${{ income.amount | number:'1.2-2' }}</span>
                <button 
                  class="btn-icon btn-danger"
                  (click)="deleteIncome(income.id)"
                  title="Delete income"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="income-total">
              <strong>Total Income: \${{ getTotalIncome() | number:'1.2-2' }}</strong>
            </div>
          </div>
          <ng-template #noIncome>
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No income recorded yet</p>
              <p class="text-muted">Add your first income source to get started!</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" class="alert alert-success mt-3">
        <i class="fas fa-check-circle"></i>
        Income added successfully!
      </div>
    </div>
  `,
  styles: [`
    .income-container h1 {
      color: #02318a;
      font-weight: 700;
      text-align: center;
    }

    .income-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .income-item:last-child {
      border-bottom: none;
    }

    .income-info {
      flex: 1;
    }

    .income-source {
      font-weight: 500;
      margin-bottom: 4px;
      color: #333;
    }

    .income-date {
      font-size: 0.875rem;
      color: #666;
    }

    .income-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .income-amount {
      font-weight: 600;
      color: #56ab2f;
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

    .income-total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: right;
      font-size: 1.2rem;
      color: #56ab2f;
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
  `]
})
export class IncomeComponent implements OnInit {
  incomeForm: FormGroup;
  incomeList: Income[] = [];
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService
  ) {
    this.incomeForm = this.fb.group({
      source: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadIncome();
  }

  private loadIncome(): void {
    this.budgetService.income$.subscribe(income => {
      this.incomeList = income.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  }

  onSubmit(): void {
    if (this.incomeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.incomeForm.value;
      const newIncome = {
        source: formValue.source.trim(),
        amount: parseFloat(formValue.amount),
        date: new Date(formValue.date)
      };

      this.budgetService.addIncome(newIncome);
      
      // Reset form and show success message
      this.incomeForm.reset({
        source: '',
        amount: '',
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

  deleteIncome(id: string): void {
    if (confirm('Are you sure you want to delete this income entry?')) {
      this.budgetService.deleteIncome(id);
    }
  }

  getTotalIncome(): number {
    return this.incomeList.reduce((total, income) => total + income.amount, 0);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.incomeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
