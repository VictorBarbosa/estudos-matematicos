import { Routes } from '@angular/router';

/**
 * Rotas da área de Cálculo 3.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'funcoes-de-varias-variaveis',
    title: 'Funções de várias variáveis · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis').then((m) => m.FuncoesDeVariasVariaveis),
  },
  {
    path: 'derivadas-parciais',
    title: 'Derivadas parciais · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/derivadas-parciais/derivadas-parciais').then((m) => m.DerivadasParciais),
  },
  {
    path: 'gradiente-e-direcional',
    title: 'Gradiente e derivada direcional · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional').then((m) => m.GradienteEDirecional),
  },
  {
    path: 'integrais-multiplas',
    title: 'Integrais múltiplas · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/integrais-multiplas/integrais-multiplas').then((m) => m.IntegraisMultiplas),
  },
  {
    path: 'coordenadas-no-espaco',
    title: 'Coordenadas cilíndricas e esféricas · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco').then((m) => m.CoordenadasNoEspaco),
  },
  {
    path: 'integrais-de-linha',
    title: 'Integrais de linha · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/integrais-de-linha/integrais-de-linha').then((m) => m.IntegraisDeLinha),
  },
  {
    path: 'teoremas-integrais',
    title: 'Superfície e teoremas · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-3/teoremas-integrais/teoremas-integrais').then((m) => m.TeoremasIntegrais),
  },
  { path: '', pathMatch: 'full', redirectTo: 'funcoes-de-varias-variaveis' },
];
