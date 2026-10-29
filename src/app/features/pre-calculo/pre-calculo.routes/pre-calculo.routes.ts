import { Routes } from '@angular/router';

/**
 * Rotas da área de Pré-cálculo.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'sequencias-e-series',
    title: 'Sequências e séries · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/pre-calculo/sequencias-e-series/sequencias-e-series').then((m) => m.SequenciasESeries),
  },
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
  { path: '', pathMatch: 'full', redirectTo: 'sequencias-e-series' },
];
