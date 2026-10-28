import { Routes } from '@angular/router';

/**
 * Rotas da área de Trigonometria.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'triangulo-retangulo',
    title: 'Triângulo retângulo · Estudos Matemáticos',
    loadComponent: () =>
      import('./triangulo-retangulo/triangulo-retangulo').then((m) => m.TrianguloRetangulo),
  },
  {
    path: 'circulo-trigonometrico',
    title: 'Círculo trigonométrico · Estudos Matemáticos',
    loadComponent: () => import('./circulo-trigonometrico/circulo-trigonometrico').then((m) => m.CirculoTrigonometricoTopico),
  },
  {
    path: 'seno-cosseno-tangente',
    title: 'Seno, cosseno e tangente · Estudos Matemáticos',
    loadComponent: () => import('./seno-cosseno-tangente/seno-cosseno-tangente').then((m) => m.SenoCossenoTangente),
  },
  {
    path: 'identidades-trigonometricas',
    title: 'Identidades trigonométricas · Estudos Matemáticos',
    loadComponent: () => import('./identidades-trigonometricas/identidades-trigonometricas').then((m) => m.IdentidadesTrigonometricas),
  },
  {
    path: 'lei-senos-cossenos',
    title: 'Leis dos senos e dos cossenos · Estudos Matemáticos',
    loadComponent: () => import('./lei-senos-cossenos/lei-senos-cossenos').then((m) => m.LeiSenosCossenos),
  },
  {
    path: 'funcoes-trigonometricas',
    title: 'Funções trigonométricas · Estudos Matemáticos',
    loadComponent: () => import('./funcoes-trigonometricas/funcoes-trigonometricas').then((m) => m.FuncoesTrigonometricas),
  },
  { path: '', pathMatch: 'full', redirectTo: 'triangulo-retangulo' },
];
