import { Routes } from '@angular/router';

/**
 * Rotas da área de Cálculo 1.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'limites',
    title: 'Limites · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/limites/limites').then((m) => m.Limites),
  },
  {
    path: 'limites-laterais',
    title: 'Limites laterais · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/limites-laterais/limites-laterais').then((m) => m.LimitesLaterais),
  },
  {
    path: 'continuidade',
    title: 'Continuidade · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/continuidade/continuidade').then((m) => m.Continuidade),
  },
  {
    path: 'definicao-de-derivada',
    title: 'Definição de derivada · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/definicao-de-derivada/definicao-de-derivada').then((m) => m.DefinicaoDeDerivada),
  },
  {
    path: 'regras-de-derivacao',
    title: 'Regras de derivação · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/regras-de-derivacao/regras-de-derivacao').then((m) => m.RegrasDeDerivacao),
  },
  {
    path: 'regra-da-cadeia',
    title: 'Regra da cadeia · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/regra-da-cadeia/regra-da-cadeia').then((m) => m.RegraDaCadeia),
  },
  {
    path: 'aplicacoes-da-derivada',
    title: 'Aplicações da derivada · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/aplicacoes-da-derivada/aplicacoes-da-derivada').then((m) => m.AplicacoesDaDerivada),
  },
  {
    path: 'taxa-de-variacao',
    title: 'Taxa de variação · Estudos Matemáticos',
    loadComponent: () => import('@features/calculo-1/taxa-de-variacao/taxa-de-variacao').then((m) => m.TaxaDeVariacao),
  },
  { path: '', pathMatch: 'full', redirectTo: 'limites' },
];
