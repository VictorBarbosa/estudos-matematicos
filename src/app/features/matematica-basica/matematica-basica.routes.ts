import { Routes } from '@angular/router';

/**
 * Rotas da área de Matemática básica.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'fracoes',
    title: 'Frações · Estudos Matemáticos',
    loadComponent: () => import('./fracoes/fracoes').then((m) => m.Fracoes),
  },
  {
    path: 'mmc-mdc',
    title: 'MMC e MDC · Estudos Matemáticos',
    loadComponent: () => import('./mmc-mdc/mmc-mdc').then((m) => m.MmcMdc),
  },
  {
    path: 'porcentagem',
    title: 'Porcentagem · Estudos Matemáticos',
    loadComponent: () => import('./porcentagem/porcentagem').then((m) => m.Porcentagem),
  },
  {
    path: 'potenciacao-radiciacao',
    title: 'Potenciação e radiciação · Estudos Matemáticos',
    loadComponent: () =>
      import('./potenciacao-radiciacao/potenciacao-radiciacao').then(
        (m) => m.PotenciacaoRadiciacao,
      ),
  },
  {
    path: 'razao-proporcao',
    title: 'Razão e proporção · Estudos Matemáticos',
    loadComponent: () => import('./razao-proporcao/razao-proporcao').then((m) => m.RazaoProporcao),
  },
  {
    path: 'operacoes-fundamentais',
    title: 'Operações fundamentais · Estudos Matemáticos',
    loadComponent: () =>
      import('./operacoes-fundamentais/operacoes-fundamentais').then(
        (m) => m.OperacoesFundamentais,
      ),
  },
  {
    path: 'numeros-decimais',
    title: 'Números decimais · Estudos Matemáticos',
    loadComponent: () =>
      import('./numeros-decimais/numeros-decimais').then((m) => m.NumerosDecimais),
  },
  {
    path: 'notacao-cientifica-unidades',
    title: 'Notação científica e unidades · Estudos Matemáticos',
    loadComponent: () =>
      import('./notacao-cientifica-unidades/notacao-cientifica-unidades').then(
        (m) => m.NotacaoCientificaUnidades,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'operacoes-fundamentais' },
];
