import { Routes } from '@angular/router';
import { topicoLiberadoGuard } from '@core/progressao/topico-liberado.guard/topico-liberado.guard';

/**
 * Cada área do currículo é carregada sob demanda, em seu próprio chunk.
 *
 * A ordem aqui espelha a do currículo, que é a ordem de aprendizagem: nenhuma
 * área aparece antes daquilo de que ela depende.
 *
 * O `topicoLiberadoGuard` em cada área é o que torna a trilha sequencial:
 * tópicos à frente da etapa atual não abrem nem por URL digitada.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Estudos Matemáticos',
    loadComponent: () => import('@features/home/home').then((m) => m.Home),
  },
  {
    // A revisão fica fora da trilha: ela só usa tópicos já vencidos, então não
    // há o que o guard precise barrar aqui.
    path: 'revisar',
    title: 'Revisão de hoje · Estudos Matemáticos',
    loadComponent: () => import('@features/revisar/revisar').then((m) => m.Revisar),
  },
  {
    path: 'matematica-basica',
    loadChildren: () =>
      import('@features/matematica-basica/matematica-basica.routes/matematica-basica.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'algebra',
    loadChildren: () => import('@features/algebra/algebra.routes/algebra.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'geometria',
    loadChildren: () => import('@features/geometria/geometria.routes/geometria.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'funcoes',
    loadChildren: () => import('@features/funcoes/funcoes.routes/funcoes.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'trigonometria',
    loadChildren: () =>
      import('@features/trigonometria/trigonometria.routes/trigonometria.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'vetores-matrizes',
    loadChildren: () =>
      import('@features/vetores-matrizes/vetores-matrizes.routes/vetores-matrizes.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'geometria-analitica',
    loadChildren: () =>
      import('@features/geometria-analitica/geometria-analitica.routes/geometria-analitica.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'fisica',
    loadChildren: () => import('@features/fisica/fisica.routes/fisica.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'pre-calculo',
    loadChildren: () => import('@features/pre-calculo/pre-calculo.routes/pre-calculo.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'calculo-1',
    loadChildren: () => import('@features/calculo-1/calculo-1.routes/calculo-1.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'calculo-2',
    loadChildren: () => import('@features/calculo-2/calculo-2.routes/calculo-2.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  {
    path: 'estatistica',
    loadChildren: () => import('@features/estatistica/estatistica.routes/estatistica.routes').then((m) => m.rotas),
    canActivateChild: [topicoLiberadoGuard],
  },
  { path: '**', redirectTo: '' },
];
