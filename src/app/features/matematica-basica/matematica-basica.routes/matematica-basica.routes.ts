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
    loadComponent: () => import('@features/matematica-basica/fracoes/fracoes').then((m) => m.Fracoes),
  },
  {
    path: 'mmc-mdc',
    title: 'MMC e MDC · Estudos Matemáticos',
    loadComponent: () => import('@features/matematica-basica/mmc-mdc/mmc-mdc').then((m) => m.MmcMdc),
  },
  {
    path: 'notacao-matematica',
    title: 'Notação matemática · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/matematica-basica/notacao-matematica/notacao-matematica').then(
        (m) => m.NotacaoMatematica,
      ),
  },
  {
    path: 'potenciacao-radiciacao',
    title: 'Potenciação e radiciação · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao').then(
        (m) => m.PotenciacaoRadiciacao,
      ),
  },
  {
    path: 'razao-proporcao',
    title: 'Razão e proporção · Estudos Matemáticos',
    loadComponent: () => import('@features/matematica-basica/razao-proporcao/razao-proporcao').then((m) => m.RazaoProporcao),
  },
  {
    path: 'operacoes-fundamentais',
    title: 'Operações fundamentais · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais').then(
        (m) => m.OperacoesFundamentais,
      ),
  },
  {
    path: 'numeros-decimais',
    title: 'Números decimais · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/matematica-basica/numeros-decimais/numeros-decimais').then((m) => m.NumerosDecimais),
  },
  { path: '', pathMatch: 'full', redirectTo: 'operacoes-fundamentais' },
];
