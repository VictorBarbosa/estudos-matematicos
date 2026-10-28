import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { ProgressaoService } from './progressao.service';

/**
 * Impede abrir um tópico que ainda não foi liberado.
 *
 * Quem chega por um link antigo, pelo histórico ou digitando a URL é levado de
 * volta à etapa da vez — o jogo não some, só não deixa pular a fila.
 */
export const topicoLiberadoGuard: CanActivateChildFn = (rota) => {
  const progressao = inject(ProgressaoService);
  const router = inject(Router);

  const topicoId = rota.routeConfig?.path ?? '';

  if (topicoId === '' || progressao.estaLiberada(topicoId)) {
    return true;
  }

  const atual = progressao.etapaAtual();
  return router.createUrlTree([atual?.rota ?? '/']);
};
