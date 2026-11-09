import { Routes } from '@angular/router';

/**
 * Rotas da área de Vetores e matrizes.
 *
 * Acrescente aqui cada tópico conforme ele for implementado, e marque
 * `pronto: true` no currículo para que ele apareça navegável na sidebar.
 */
export const rotas: Routes = [
  {
    path: 'vetores-no-plano',
    title: 'Vetores no plano · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/vetores-no-plano/vetores-no-plano').then(
        (m) => m.VetoresNoPlano,
      ),
  },
  {
    path: 'produto-escalar-vetorial',
    title: 'Produto escalar e vetorial · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial').then(
        (m) => m.ProdutoEscalarVetorial,
      ),
  },
  {
    path: 'vetores-no-espaco',
    title: 'Vetores no espaço · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco').then(
        (m) => m.VetoresNoEspaco,
      ),
  },
  {
    path: 'matrizes-determinantes',
    title: 'Matrizes e determinantes · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/matrizes-determinantes/matrizes-determinantes').then(
        (m) => m.MatrizesDeterminantes,
      ),
  },
  {
    path: 'escalonamento-e-inversa',
    title: 'Escalonamento e matriz inversa · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa').then(
        (m) => m.EscalonamentoEInversa,
      ),
  },
  {
    path: 'numeros-complexos',
    title: 'Números complexos · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/vetores-matrizes/numeros-complexos/numeros-complexos').then(
        (m) => m.NumerosComplexos,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'vetores-no-plano' },
];
