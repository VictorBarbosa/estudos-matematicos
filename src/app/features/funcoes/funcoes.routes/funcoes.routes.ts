import { Routes } from '@angular/router';

/**
 * Rotas da área de Funções.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'funcao-afim',
    title: 'Função afim · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/funcao-afim/funcao-afim').then((m) => m.FuncaoAfim),
  },
  {
    path: 'funcao-quadratica',
    title: 'Função quadrática · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/funcao-quadratica/funcao-quadratica').then((m) => m.FuncaoQuadratica),
  },
  {
    path: 'funcao-exponencial',
    title: 'Função exponencial · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/funcao-exponencial/funcao-exponencial').then((m) => m.FuncaoExponencial),
  },
  {
    path: 'funcao-logaritmica',
    title: 'Função logarítmica · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/funcao-logaritmica/funcao-logaritmica').then((m) => m.FuncaoLogaritmica),
  },
  {
    path: 'funcao-modular',
    title: 'Função modular · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/funcao-modular/funcao-modular').then((m) => m.FuncaoModular),
  },
  {
    path: 'conceito-funcao',
    title: 'Conceito de função · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/conceito-funcao/conceito-funcao').then((m) => m.ConceitoFuncao),
  },
  {
    path: 'composicao-inversa',
    title: 'Composição e inversa · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/composicao-inversa/composicao-inversa').then((m) => m.ComposicaoInversa),
  },
  {
    path: 'progressoes',
    title: 'Progressões · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/progressoes/progressoes').then((m) => m.Progressoes),
  },
  {
    path: 'juros-compostos',
    title: 'Juros compostos · Estudos Matemáticos',
    loadComponent: () => import('@features/funcoes/juros-compostos/juros-compostos').then((m) => m.JurosCompostos),
  },
  { path: '', pathMatch: 'full', redirectTo: 'conceito-funcao' },
];
