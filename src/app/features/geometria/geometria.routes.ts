import { Routes } from '@angular/router';

/**
 * Rotas da área de Geometria plana e espacial.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'angulos-e-triangulos',
    title: 'Ângulos e triângulos · Estudos Matemáticos',
    loadComponent: () =>
      import('./angulos-e-triangulos/angulos-e-triangulos').then((m) => m.AngulosETriangulos),
  },
  {
    path: 'semelhanca-e-pitagoras',
    title: 'Semelhança e Pitágoras · Estudos Matemáticos',
    loadComponent: () =>
      import('./semelhanca-e-pitagoras/semelhanca-e-pitagoras').then((m) => m.SemelhancaEPitagoras),
  },
  {
    path: 'areas-de-figuras-planas',
    title: 'Áreas de figuras planas · Estudos Matemáticos',
    loadComponent: () =>
      import('./areas-de-figuras-planas/areas-de-figuras-planas').then(
        (m) => m.AreasDeFigurasPlanas,
      ),
  },
  {
    path: 'circulo-e-poligonos',
    title: 'Círculo e polígonos · Estudos Matemáticos',
    loadComponent: () =>
      import('./circulo-e-poligonos/circulo-e-poligonos').then((m) => m.CirculoEPoligonos),
  },
  {
    path: 'solidos-e-volumes',
    title: 'Sólidos e volumes · Estudos Matemáticos',
    loadComponent: () =>
      import('./solidos-e-volumes/solidos-e-volumes').then((m) => m.SolidosEVolumes),
  },
  { path: '', pathMatch: 'full', redirectTo: 'angulos-e-triangulos' },
];
