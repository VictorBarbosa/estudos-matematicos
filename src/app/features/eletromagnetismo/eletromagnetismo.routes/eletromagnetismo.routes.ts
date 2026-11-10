import { Routes } from '@angular/router';

/** Rotas da área de Eletricidade e magnetismo (0P02). */
export const rotas: Routes = [
  {
    path: 'eletrostatica',
    title: 'Eletrostática · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/eletromagnetismo/eletrostatica/eletrostatica').then((m) => m.Eletrostatica),
  },
  {
    path: 'potencial-e-capacitores',
    title: 'Potencial e capacitores · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores').then(
        (m) => m.PotencialECapacitores,
      ),
  },
  {
    path: 'circuitos',
    title: 'Circuitos · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/eletromagnetismo/circuitos/circuitos').then((m) => m.Circuitos),
  },
  {
    path: 'magnetismo-e-inducao',
    title: 'Magnetismo e indução · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/eletromagnetismo/magnetismo-e-inducao/magnetismo-e-inducao').then(
        (m) => m.MagnetismoEInducao,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'eletrostatica' },
];
