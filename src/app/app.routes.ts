import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: '/summary', pathMatch: 'full' },
  { 
    path: 'summary', 
    loadComponent: () => import('./components/summary/summary.component').then(m => m.SummaryComponent)
  },
  { 
    path: 'income', 
    loadComponent: () => import('./components/income/income.component').then(m => m.IncomeComponent)
  },
  { 
    path: 'expenses', 
    loadComponent: () => import('./components/expenses/expenses.component').then(m => m.ExpensesComponent)
  },
  { path: '**', redirectTo: '/summary' }
];