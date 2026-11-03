import { Routes } from '@angular/router';

/**
 * Rotas da área de Pré-cálculo.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'nocao-intuitiva-de-limite',
    title: 'Noção intuitiva de limite · Estudos Matemáticos',
    loadComponent: () => import('@features/pre-calculo/nocao-intuitiva-de-limite/nocao-intuitiva-de-limite').then((m) => m.NocaoIntuitivaDeLimite),
  },
  {
    path: 'vizinhancas-e-infinito',
    title: 'Vizinhanças e infinito · Estudos Matemáticos',
    loadComponent: () => import('@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito').then((m) => m.VizinhancasEInfinito),
  },
  { path: '', pathMatch: 'full', redirectTo: 'nocao-intuitiva-de-limite' },
];
