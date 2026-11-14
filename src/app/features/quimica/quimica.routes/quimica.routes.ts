import { Routes } from '@angular/router';

/**
 * Rotas da área de Química.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'atomos-isotopos-ions',
    title: 'Átomos, isótopos e íons · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions').then(
        (m) => m.AtomosIsotoposIons,
      ),
  },
  {
    path: 'mol-e-massa-molar',
    title: 'O mol e a massa molar · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/quimica/mol-e-massa-molar/mol-e-massa-molar').then((m) => m.MolEMassaMolar),
  },
];
