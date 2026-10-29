import { Routes } from '@angular/router';

/**
 * Rotas da área de Cálculo 2.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'soma-de-riemann',
    title: 'Soma de Riemann · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/soma-de-riemann/soma-de-riemann').then((m) => m.SomaDeRiemann),
  },
  {
    path: 'integral-indefinida',
    title: 'Integral indefinida · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/integral-indefinida/integral-indefinida').then((m) => m.IntegralIndefinida),
  },
  {
    path: 'integral-definida',
    title: 'Integral definida · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/integral-definida/integral-definida').then((m) => m.IntegralDefinida),
  },
  {
    path: 'teorema-fundamental',
    title: 'Teorema fundamental do cálculo · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/teorema-fundamental/teorema-fundamental').then((m) => m.TeoremaFundamental),
  },
  {
    path: 'tecnicas-de-integracao',
    title: 'Técnicas de integração · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao').then((m) => m.TecnicasDeIntegracao),
  },
  {
    path: 'aplicacoes-da-integral',
    title: 'Aplicações da integral · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral').then((m) => m.AplicacoesDaIntegral),
  },
  { path: '', pathMatch: 'full', redirectTo: 'soma-de-riemann' },
];
