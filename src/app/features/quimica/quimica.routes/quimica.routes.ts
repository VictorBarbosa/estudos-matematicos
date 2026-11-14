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
];
