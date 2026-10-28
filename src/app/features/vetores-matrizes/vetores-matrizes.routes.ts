import { Routes } from '@angular/router';

/**
 * Rotas da área de Vetores e matrizes.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'vetores-no-plano',
    title: 'Vetores no plano · Estudos Matemáticos',
    loadComponent: () => import('./vetores-no-plano/vetores-no-plano').then((m) => m.VetoresNoPlano),
  },
  {
    path: 'produto-escalar-vetorial',
    title: 'Produto escalar e vetorial · Estudos Matemáticos',
    loadComponent: () =>
      import('./produto-escalar-vetorial/produto-escalar-vetorial').then(
        (m) => m.ProdutoEscalarVetorial,
      ),
  },
  {
    path: 'matrizes-determinantes',
    title: 'Matrizes e determinantes · Estudos Matemáticos',
    loadComponent: () =>
      import('./matrizes-determinantes/matrizes-determinantes').then(
        (m) => m.MatrizesDeterminantes,
      ),
  },
  {
    path: 'numeros-complexos',
    title: 'Números complexos · Estudos Matemáticos',
    loadComponent: () =>
      import('./numeros-complexos/numeros-complexos').then((m) => m.NumerosComplexos),
  },
  { path: '', pathMatch: 'full', redirectTo: 'vetores-no-plano' },
];
