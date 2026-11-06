import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'calculadora',
    loadComponent: () => import('./calculadora/calculadora.page').then((m) => m.CalculadoraPage),
  },
  {
    path: '',
    redirectTo: 'calculadora',
    pathMatch: 'full',
  },
];
