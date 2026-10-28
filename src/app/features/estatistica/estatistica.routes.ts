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
      import('./analise-combinatoria/analise-combinatoria').then((m) => m.AnaliseCombinatoria),
  },
  {
    path: 'probabilidade',
    title: 'Probabilidade · Estudos Matemáticos',
    loadComponent: () => import('./probabilidade/probabilidade').then((m) => m.Probabilidade),
  },
  {
    path: 'estatistica-e-incerteza',
    title: 'Estatística e incerteza · Estudos Matemáticos',
    loadComponent: () =>
      import('./estatistica-e-incerteza/estatistica-e-incerteza').then(
        (m) => m.EstatisticaEIncerteza,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'analise-combinatoria' },
];
