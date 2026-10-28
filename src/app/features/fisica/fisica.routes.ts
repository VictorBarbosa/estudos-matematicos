import { Routes } from '@angular/router';

/**
 * Rotas da área de Física.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'analise-dimensional',
    title: 'Grandezas e análise dimensional · Estudos Matemáticos',
    loadComponent: () =>
      import('./analise-dimensional/analise-dimensional').then((m) => m.AnaliseDimensional),
  },
  {
    path: 'cinematica-escalar',
    title: 'Cinemática escalar · Estudos Matemáticos',
    loadComponent: () =>
      import('./cinematica-escalar/cinematica-escalar').then((m) => m.CinematicaEscalar),
  },
  {
    path: 'trajetoria-balistica',
    title: 'Trajetória balística · Estudos Matemáticos',
    loadComponent: () =>
      import('./trajetoria-balistica/trajetoria-balistica').then((m) => m.TrajetoriaBalistica),
  },
  {
    path: 'leis-de-newton',
    title: 'Leis de Newton · Estudos Matemáticos',
    loadComponent: () => import('./leis-de-newton/leis-de-newton').then((m) => m.LeisDeNewton),
  },
  {
    path: 'trabalho-e-energia',
    title: 'Trabalho e energia · Estudos Matemáticos',
    loadComponent: () =>
      import('./trabalho-e-energia/trabalho-e-energia').then((m) => m.TrabalhoEEnergia),
  },
  {
    path: 'impulso-e-momento',
    title: 'Impulso e momento linear · Estudos Matemáticos',
    loadComponent: () =>
      import('./impulso-e-momento/impulso-e-momento').then((m) => m.ImpulsoEMomento),
  },
  {
    path: 'movimento-harmonico',
    title: 'Movimento harmônico · Estudos Matemáticos',
    loadComponent: () =>
      import('./movimento-harmonico/movimento-harmonico').then((m) => m.MovimentoHarmonico),
  },
  {
    path: 'estatica-e-torque',
    title: 'Estática e torque · Estudos Matemáticos',
    loadComponent: () =>
      import('./estatica-e-torque/estatica-e-torque').then((m) => m.EstaticaETorque),
  },
  {
    path: 'gravitacao-e-orbitas',
    title: 'Gravitação e órbitas · Estudos Matemáticos',
    loadComponent: () =>
      import('./gravitacao-e-orbitas/gravitacao-e-orbitas').then((m) => m.GravitacaoEOrbitas),
  },
  {
    path: 'fluidos-e-aerodinamica',
    title: 'Fluidos e aerodinâmica · Estudos Matemáticos',
    loadComponent: () =>
      import('./fluidos-e-aerodinamica/fluidos-e-aerodinamica').then(
        (m) => m.FluidosEAerodinamica,
      ),
  },
  {
    path: 'termodinamica-e-gases',
    title: 'Termodinâmica e gases · Estudos Matemáticos',
    loadComponent: () =>
      import('./termodinamica-e-gases/termodinamica-e-gases').then((m) => m.TermodinamicaEGases),
  },
  {
    path: 'propulsao-de-foguetes',
    title: 'Propulsão de foguetes · Estudos Matemáticos',
    loadComponent: () =>
      import('./propulsao-de-foguetes/propulsao-de-foguetes').then((m) => m.PropulsaoDeFoguetes),
  },
  { path: '', pathMatch: 'full', redirectTo: 'analise-dimensional' },
];
