import { Routes } from '@angular/router';

/**
 * Rotas da área de Geometria analítica.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'ponto-e-reta',
    title: 'Ponto e reta · Estudos Matemáticos',
    loadComponent: () => import('@features/geometria-analitica/ponto-e-reta/ponto-e-reta').then((m) => m.PontoEReta),
  },
  {
    path: 'circunferencia',
    title: 'Circunferência · Estudos Matemáticos',
    loadComponent: () => import('@features/geometria-analitica/circunferencia/circunferencia').then((m) => m.Circunferencia),
  },
  {
    path: 'conicas',
    title: 'Cônicas · Estudos Matemáticos',
    loadComponent: () => import('@features/geometria-analitica/conicas/conicas').then((m) => m.Conicas),
  },
  { path: '', pathMatch: 'full', redirectTo: 'ponto-e-reta' },
];
