import { Routes } from '@angular/router';

/**
 * Rotas da área de Combinatória e estatística.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'analise-combinatoria',
    title: 'Análise combinatória · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/estatistica/analise-combinatoria/analise-combinatoria').then((m) => m.AnaliseCombinatoria),
  },
  {
    path: 'probabilidade',
    title: 'Probabilidade · Estudos Matemáticos',
    loadComponent: () => import('@features/estatistica/probabilidade/probabilidade').then((m) => m.Probabilidade),
  },
  {
    path: 'estatistica-e-incerteza',
    title: 'Estatística e incerteza · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza').then(
        (m) => m.EstatisticaEIncerteza,
      ),
  },
  {
    path: 'distribuicao-normal',
    title: 'Distribuição normal · Estudos Matemáticos',
    loadComponent: () => import('@features/estatistica/distribuicao-normal/distribuicao-normal').then((m) => m.DistribuicaoNormal),
  },
  {
    path: 'regressao-e-correlacao',
    title: 'Regressão e correlação · Estudos Matemáticos',
    loadComponent: () => import('@features/estatistica/regressao-e-correlacao/regressao-e-correlacao').then((m) => m.RegressaoECorrelacao),
  },
  { path: '', pathMatch: 'full', redirectTo: 'analise-combinatoria' },
];
