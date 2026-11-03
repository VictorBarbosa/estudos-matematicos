import { Routes } from '@angular/router';

/**
 * Rotas da área de Cálculo 4.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'edo-primeira-ordem',
    title: 'EDO de primeira ordem · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem').then((m) => m.EdoPrimeiraOrdem),
  },
  {
    path: 'edo-segunda-ordem',
    title: 'EDO de segunda ordem · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem').then((m) => m.EdoSegundaOrdem),
  },
  {
    path: 'aplicacoes-de-edo',
    title: 'Aplicações de EDO · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo').then((m) => m.AplicacoesDeEdo),
  },
  {
    path: 'metodos-numericos',
    title: 'Métodos numéricos · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-4/metodos-numericos/metodos-numericos').then((m) => m.MetodosNumericos),
  },
  { path: '', pathMatch: 'full', redirectTo: 'edo-primeira-ordem' },
];
