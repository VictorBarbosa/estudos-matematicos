import { Routes } from '@angular/router';

/**
 * Rotas da área de Ondas e física moderna (curso 0P03 do cégep).
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'ondas-e-som',
    title: 'Ondas e som · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som').then((m) => m.OndasESom),
  },
  {
    path: 'optica',
    title: 'Óptica · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/ondas-e-fisica-moderna/optica/optica').then((m) => m.Optica),
  },
  {
    path: 'fisica-moderna',
    title: 'Física moderna · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna').then(
        (m) => m.FisicaModerna,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'ondas-e-som' },
];
