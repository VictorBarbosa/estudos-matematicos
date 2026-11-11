import { Routes } from '@angular/router';
import { topicoLiberadoGuard } from '@core/progressao/topico-liberado.guard/topico-liberado.guard';
import { semSurpresaAtivaGuard } from '@core/prova/surpresa.guard/surpresa.guard';

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
    /*
     * A prova surpresa.
     *
     * Fora da trilha e sem o guard de tópico: ela é a única porta que fica
     * aberta enquanto as outras fecham. A própria página diz o que fazer
     * quando não há prova em andamento.
     */
    path: 'surpresa',
    title: 'Prova surpresa · Estudos Matemáticos',
    loadComponent: () => import('@features/surpresa/surpresa').then((m) => m.Surpresa),
  },
  {
    // A revisão fica fora da trilha: ela só usa tópicos já vencidos, então não
    // há o que o guard de tópico precise barrar aqui. Mas revisar é estudar, e
    // com uma prova surpresa aberta o estudo espera.
    path: 'revisar',
    title: 'Revisão de hoje · Estudos Matemáticos',
    canActivate: [semSurpresaAtivaGuard],
    loadComponent: () => import('@features/revisar/revisar').then((m) => m.Revisar),
  },
  {
    // Os números da progressão. Fora da trilha e sem guard: é tela de ajuste,
    // não de estudo.
    path: 'configuracoes',
    title: 'Configurações · Estudos Matemáticos',
    loadComponent: () =>
      import('@features/configuracoes/configuracoes').then((m) => m.Configuracoes),
  },
  {
    /*
     * A prova de fim de sessão fica fora da trilha, e sem guard.
     *
     * Quem chega aqui sem direito vê a própria página dizer que a prova abre
     * quando as etapas da sessão estiverem vencidas — explicar é melhor que
     * redirecionar em silêncio, e a página não deixa responder nada.
     */
    path: 'prova/:sessaoId',
    title: 'Prova final · Estudos Matemáticos',
    // Fazer a prova de área no meio de uma surpresa seria trocar a medida:
    // uma cobra o que foi aprendido, a outra serve para fugir dela.
    canActivate: [semSurpresaAtivaGuard],
    loadComponent: () => import('@features/prova/prova').then((m) => m.Prova),
  },
  {
    path: 'matematica-basica',
    loadChildren: () =>
      import('@features/matematica-basica/matematica-basica.routes/matematica-basica.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'algebra',
    loadChildren: () =>
      import('@features/algebra/algebra.routes/algebra.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'geometria',
    loadChildren: () =>
      import('@features/geometria/geometria.routes/geometria.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'funcoes',
    loadChildren: () =>
      import('@features/funcoes/funcoes.routes/funcoes.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'trigonometria',
    loadChildren: () =>
      import('@features/trigonometria/trigonometria.routes/trigonometria.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'vetores-matrizes',
    loadChildren: () =>
      import('@features/vetores-matrizes/vetores-matrizes.routes/vetores-matrizes.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'geometria-analitica',
    loadChildren: () =>
      import('@features/geometria-analitica/geometria-analitica.routes/geometria-analitica.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'fisica',
    loadChildren: () => import('@features/fisica/fisica.routes/fisica.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'eletromagnetismo',
    loadChildren: () =>
      import('@features/eletromagnetismo/eletromagnetismo.routes/eletromagnetismo.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'ondas-e-fisica-moderna',
    loadChildren: () =>
      import('@features/ondas-e-fisica-moderna/ondas-e-fisica-moderna.routes/ondas-e-fisica-moderna.routes').then(
        (m) => m.rotas,
      ),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'pre-calculo',
    loadChildren: () =>
      import('@features/pre-calculo/pre-calculo.routes/pre-calculo.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'calculo-1',
    loadChildren: () =>
      import('@features/calculo-1/calculo-1.routes/calculo-1.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'calculo-2',
    loadChildren: () =>
      import('@features/calculo-2/calculo-2.routes/calculo-2.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'estatistica',
    loadChildren: () =>
      import('@features/estatistica/estatistica.routes/estatistica.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'calculo-3',
    loadChildren: () =>
      import('@features/calculo-3/calculo-3.routes/calculo-3.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  {
    path: 'calculo-4',
    loadChildren: () =>
      import('@features/calculo-4/calculo-4.routes/calculo-4.routes').then((m) => m.rotas),
    canActivateChild: [semSurpresaAtivaGuard, topicoLiberadoGuard],
  },
  { path: '**', redirectTo: '' },
];
