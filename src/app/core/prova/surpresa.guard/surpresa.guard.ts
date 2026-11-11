import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';

/**
 * Com uma prova surpresa em andamento, o estudo espera.
 *
 * A prova só some quando é terminada — é o que a torna uma medida em vez de um
 * convite. Deixar abrir um tópico, ou a revisão do dia, enquanto ela está
 * aberta transformaria «surpresa» em «opcional»: bastaria navegar para
 * estudar o assunto antes de responder.
 *
 * O que fica liberado: a própria prova, a página inicial, as configurações e a
 * teoria dentro da prova. Sem essas portas abertas, um gerador com problema
 * prenderia o aluno numa tela sem saída.
 */
export const semSurpresaAtivaGuard: CanActivateFn = () => {
  const surpresa = inject(ProvaSurpresaService);
  const router = inject(Router);

  if (surpresa.ativa() === null) {
    return true;
  }

  return router.createUrlTree(['/surpresa']);
};
