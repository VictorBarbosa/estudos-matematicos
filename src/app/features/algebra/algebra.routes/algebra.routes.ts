import { Routes } from '@angular/router';

/**
 * Rotas da área de Álgebra.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'equacao-primeiro-grau',
    title: 'Equação do 1º grau · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau').then((m) => m.EquacaoPrimeiroGrau),
  },
  {
    path: 'equacao-segundo-grau',
    title: 'Equação do 2º grau · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/algebra/equacao-segundo-grau/equacao-segundo-grau').then((m) => m.EquacaoSegundoGrau),
  },
  {
    path: 'produtos-notaveis',
    title: 'Produtos notáveis · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/algebra/produtos-notaveis/produtos-notaveis').then((m) => m.ProdutosNotaveis),
  },
  {
    path: 'fatoracao',
    title: 'Fatoração · Estudos Matemáticos',
    loadComponent: () => import('@features/algebra/fatoracao/fatoracao').then((m) => m.Fatoracao),
  },
  {
    path: 'sistemas-lineares',
    title: 'Sistemas lineares · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/algebra/sistemas-lineares/sistemas-lineares').then((m) => m.SistemasLineares),
  },
  {
    path: 'inequacoes',
    title: 'Inequações · Estudos Matemáticos',
    loadComponent: () => import('@features/algebra/inequacoes/inequacoes').then((m) => m.Inequacoes),
  },
  {
    path: 'expressoes-algebricas',
    title: 'Expressões algébricas · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/algebra/expressoes-algebricas/expressoes-algebricas').then((m) => m.ExpressoesAlgebricas),
  },
  {
    path: 'polinomios',
    title: 'Polinômios · Estudos Matemáticos',
    loadComponent: () => import('@features/algebra/polinomios/polinomios').then((m) => m.Polinomios),
  },
  { path: '', pathMatch: 'full', redirectTo: 'expressoes-algebricas' },
];
