import { Injectable, computed, inject, signal } from '@angular/core';
import { Idioma } from '@core/i18n/models/i18n.model';
import { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';
import { NIVEIS, PedidoDeProblema } from '@core/problemas/prompt/montar-prompt';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { OllamaService } from '@core/assistente/services/ollama.service';
import type { ConfiguracaoDaLlm } from '@core/configuracao/models/llm.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { LoteDeHistorias } from '@core/problemas/servicos/lote-de-historias';
import { ModeloDeProblema, assinaturaDoModelo } from '@core/problemas/validacao/validar-modelo';
import { ValorDaLacuna, vestirEnunciado } from '@core/problemas/vestir/vestir-enunciado';

/**
 * A fila de histórias, e quem decide se uma aparece.
 *
 * O desenho tem uma regra acima de todas: **o treino nunca espera.** O
 * exercício aparece no instante em que é sorteado, com o enunciado que o
 * gerador escreveu; se houver história pronta na fila, ela veste aquele
 * exercício. Nada aqui bloqueia a tela, e nada aqui pode deixar o treino sem
 * exercício — é por isso que todo caminho de erro termina em «não veste».
 *
 * A fila existe para que a espera aconteça uma vez só. Um lote traz seis
 * histórias de uma vez; ao consumir uma, se sobrarem menos de três a reposição
 * dispara em segundo plano. Quando você termina um exercício, o seguinte já
 * está vestido.
 *
 * ## O cache não é otimização, é alcance
 *
 * O que já voltou da LLM fica em `localStorage`. Num dia em que o Ollama não
 * esteja ligado — ou no celular, onde ele nunca estará —, as histórias já
 * vistas continuam valendo. É a única parte deste serviço que funciona sem a
 * LLM, e foi feita de propósito: a rota ao vivo deixa o celular de fora, e
 * isto devolve ao menos o que já passou por aqui.
 *
 * ## Por que existe «esta história está errada»
 *
 * O portão (`validar-modelo`) confere formato, não sentido. Na comparação de
 * 14/11 passou esta: «Um caminhão faz {0} voltas por dia, tem {1} cargas
 * iniciais e chega a {2} cargas no final da jornada. Quantas voltas
 * completou?» — a pergunta cobra voltas, a história contabiliza cargas.
 * Nenhuma expressão regular pega isso, e no modo ao vivo não há etapa de
 * revisão antes de publicar. Então o aluno é o revisor: `descartar` apaga a
 * história do cache e da fila, guarda a assinatura numa lista negra, e aquela
 * história não volta.
 */

/** A chave da fila: a história serve para um tópico, uma forma e um nível. */
function chaveDe(topicoId: string, forma: string, nivel: string): string {
  return `${topicoId}|${forma}|${nivel}`;
}

/*
 * `v2` porque o `v1` ficou envenenado.
 *
 * As primeiras histórias de equação do primeiro grau expressavam outra conta —
 * «já completou {1} viagens» é `{2} − {0}×{1}`, não `({2} − {1}) / {0}` — e
 * seis de oito estavam assim. Corrigir o prompt não apaga o que já está no
 * navegador de quem usou, e uma história errada guardada é pior que nenhuma:
 * ela volta todo dia. Subir a versão da chave descarta o lote inteiro.
 */
const CHAVE_DO_CACHE = 'estudos-matematicos.problemas.v2';
const CHAVE_DA_LISTA_NEGRA = 'estudos-matematicos.problemas.descartados.v1';

/**
 * Teto do cache em bytes.
 *
 * O rascunho aprendeu isto do jeito difícil: um teto apertado fez a
 * persistência parar de funcionar no segundo tópico. Aqui o teto é largo e,
 * ao estourar, os tópicos mais antigos são largados em vez de se desistir de
 * gravar.
 */
const LIMITE_DE_BYTES = 256 * 1024;

/**
 * Quantas histórias na fila antes de pedir mais.
 *
 * Era três, quando o lote trazia seis de um nível só. Com o lote por nível em
 * dois, um piso de três pediria de novo a cada exercício: a fila nunca chega a
 * três, então `atribuir` dispararia reposição sempre. Com piso um, a cadência
 * fica uma reposição a cada dois exercícios de cada nível — o lote rende, e a
 * fila não seca entre um e outro.
 */
const PISO_DA_FILA = 1;

interface CacheGravado {
  readonly [chave: string]: readonly ModeloDeProblema[];
}

@Injectable({ providedIn: 'root' })
export class HistoriasService {
  private readonly ollama = inject(OllamaService);
  private readonly assistente = inject(AssistenteService);
  private readonly lote = new LoteDeHistorias(this.ollama);

  private readonly configuracaoDoSite = inject(ConfiguracaoService);

  /**
   * O que vale: o que a tela de configurações deixou, com uma herança.
   *
   * A configuração vive em `ConfiguracaoService` desde que deixou de ser
   * constante no código — antes, trocar de modelo exigia um deploy.
   *
   * **O endereço tem herança; o modelo, não.** Se o aluno não escreveu um
   * endereço, herda-se o do assistente, e isso dá zero configuração: quem já
   * usa o assistente não precisa configurar nada para as histórias
   * funcionarem. O modelo nunca é herdado, e a razão é medida: o do assistente
   * é escolhido para CONVERSAR, e um de 43 GB fez o lote estourar o prazo.
   * Escrever enunciado em lote é tarefa de modelo rápido.
   */
  private readonly configuracao = computed<ConfiguracaoDaLlm>(() => {
    const escolhida = this.configuracaoDoSite.configuracaoDaLlm();

    return {
      ...escolhida,
      endpoint: escolhida.endpoint || this.assistente.servidor(),
    };
  });

  /** A fila por chave. Nasce do cache e cresce com o que a LLM traz. */
  private readonly filas =
    signal<Readonly<Record<string, readonly ModeloDeProblema[]>>>(lerCache());

  /** As histórias que o aluno marcou como erradas, por assinatura. */
  private readonly listaNegra = signal<readonly string[]>(lerListaNegra());

  /** Que história está vestindo cada exercício, pelo id dele. */
  private readonly atribuidas = signal<Readonly<Record<string, ModeloDeProblema>>>({});

  /**
   * Os exercícios que apareceram ANTES de haver história para eles.
   *
   * **O defeito que isto corrige é o mais caro de todos**, porque fazia o
   * recurso parecer inexistente: o exercício entra na tela no mesmo instante em
   * que é sorteado, e o lote leva de 20 a 120 segundos. Quando a história
   * chegava, ninguém voltava ao exercício que já estava ali — ele ficava com o
   * enunciado de sempre para sempre, e o aluno concluía que a LLM não estava
   * sendo usada.
   *
   * A chave é o id do exercício; o valor, o que é preciso para vesti-lo depois.
   */
  private readonly esperando = signal<
    Readonly<Record<string, { readonly chave: string; readonly lacunas: number }>>
  >({});

  /**
   * As chaves cujo lote está sendo pedido agora.
   *
   * Num sinal, e não num `Set` solto, porque a tela precisa reagir a isto —
   * e reagir por TÓPICO. `preparando` é global («há algum lote em voo»), e com
   * ele o aviso de que a LLM está escrevendo aparecia em tópicos que nem
   * declaram história: o aluno via «escrevendo os enunciados» numa pergunta de
   * ângulos e triângulos, que nunca recebe uma.
   */
  private readonly emVoo = signal<readonly string[]>([]);

  /** Ligado quando há endereço configurado e as tentativas não desistiram. */
  readonly ligado = signal(true);

  /** Verdadeiro enquanto há algum lote em voo, em qualquer tópico. */
  readonly preparando = computed(() => this.lote.pedindo());

  /**
   * ESTE tópico e esta forma estão esperando o primeiro lote?
   *
   * É a pergunta que a tela faz para escolher entre mostrar a espera e mostrar
   * o exercício — nunca os dois, que era a confusão: o aviso ao lado da
   * pergunta pronta faz parecer que a tela está pela metade.
   *
   * Verdadeiro só com lote em voo para esta chave E a fila vazia: com fila
   * cheia não há espera nenhuma, e lote de outro tópico não é da conta desta
   * tela.
   */
  esperandoPrimeiroLote(topicoId: string, forma: string, nivel: string): boolean {
    const filaVazia = (this.filas()[chaveDe(topicoId, forma, nivel)] ?? []).length === 0;

    if (!filaVazia) {
      return false;
    }

    // Em voo, ou a ponto de ir: sem a segunda metade, o enunciado de sempre
    // piscava na tela no instante entre o exercício aparecer e o pedido sair,
    // porque quem dispara o pedido é um `effect`, que roda depois do primeiro
    // desenho. «Vai tentar» cobre esse vão.
    return this.emVoo().includes(`${topicoId}|${forma}`) || this.vaiTentar();
  }

  /**
   * Ainda vale pedir à LLM?
   *
   * Falso com o mecanismo desligado nas Configurações e falso depois das
   * falhas seguidas — e é isso que impede a tela de esperar para sempre por
   * quem não vai responder. Com o Ollama fora do ar, a primeira tentativa
   * falha depressa e o exercício aparece.
   */
  vaiTentar(): boolean {
    return this.ligado() && this.lote.valeTentarDeNovo();
  }

  /** Esquece as falhas ao entrar noutro tópico. */
  recomecar(): void {
    this.lote.recomecar();
  }

  /**
   * Garante uma história para este exercício, se houver.
   *
   * Chamado de um `effect`, nunca de um `computed`: ele atribui e dispara
   * reposição, que são efeitos. O exercício já está na tela quando isto roda.
   */
  atribuir(
    exercicioId: string,
    topicoId: string,
    nivel: string,
    declaracao: ProblemaDeTexto,
    valores: readonly ValorDaLacuna[],
    modo: 'declarada' | 'reescrita' = 'declarada',
  ): void {
    if (this.atribuidas()[exercicioId] !== undefined) {
      return;
    }

    const chave = chaveDe(topicoId, declaracao.forma, nivel);
    const fila = this.filas()[chave] ?? [];
    const servem = fila.filter((modelo) => modelo.lacunas === valores.length);

    if (servem.length > 0) {
      const escolhida = servem[0]!;

      this.atribuidas.update((atuais) => ({ ...atuais, [exercicioId]: escolhida }));
      this.filas.update((atuais) => ({
        ...atuais,
        [chave]: (atuais[chave] ?? []).filter((modelo) => modelo !== escolhida),
      }));
      this.gravarCache();
    } else {
      /*
       * Nada na fila: o exercício entra para a lista de espera. É o caso
       * NORMAL no primeiro exercício de um tópico, e era o que se perdia.
       */
      this.esperando.update((atuais) => ({
        ...atuais,
        [exercicioId]: { chave, lacunas: valores.length },
      }));
    }

    /*
     * A reposição pede os QUATRO níveis, não só o deste exercício.
     *
     * Antes pedia um lote do nível corrente, e isso tinha um custo escondido:
     * quatro pedidos para cobrir os quatro níveis, cada um esperando o outro.
     * Quem estudava via sempre o mesmo grau de leitura até os demais chegarem.
     * Agora um lote só enche as quatro filas, e o exercício seguinte — de
     * qualquer nível — já encontra história.
     */
    if ((this.filas()[chave] ?? []).length < PISO_DA_FILA) {
      void this.repor(topicoId, declaracao.forma, declaracao, modo);
    }
  }

  /** O enunciado vestido, ou `undefined` para quem chama usar o de sempre. */
  vestir(
    exercicioId: string,
    valores: readonly ValorDaLacuna[],
    idioma: Idioma,
    contrato?: ProblemaDeTexto['contrato'],
  ): string | undefined {
    const modelo = this.atribuidas()[exercicioId];

    return modelo === undefined ? undefined : vestirEnunciado(modelo, valores, idioma, contrato);
  }

  /** Há história vestindo este exercício? Decide se o botão de descarte aparece. */
  temHistoria(exercicioId: string): boolean {
    return this.atribuidas()[exercicioId] !== undefined;
  }

  /**
   * «Esta história está errada»: apaga e não mostra de novo.
   *
   * Tira da atribuição — o enunciado de sempre volta no mesmo instante —, tira
   * de todas as filas e guarda a assinatura. É o único canal de correção que a
   * rota ao vivo tem.
   */
  descartar(exercicioId: string): void {
    const modelo = this.atribuidas()[exercicioId];

    if (modelo === undefined) {
      return;
    }

    const assinatura = assinaturaDoModelo(modelo);

    this.listaNegra.update((atuais) =>
      atuais.includes(assinatura) ? atuais : [...atuais, assinatura],
    );

    this.atribuidas.update((atuais) => {
      const restantes = { ...atuais };
      delete restantes[exercicioId];
      return restantes;
    });

    // O exercício descartado não fica esperando de novo: o aluno pediu o
    // enunciado de sempre para ele.
    this.esperando.update((atuais) => {
      const restantes = { ...atuais };
      delete restantes[exercicioId];
      return restantes;
    });

    this.filas.update((atuais) =>
      Object.fromEntries(
        Object.entries(atuais).map(([chave, modelos]) => [
          chave,
          modelos.filter((atual) => assinaturaDoModelo(atual) !== assinatura),
        ]),
      ),
    );

    this.gravarCache();
    gravarListaNegra(this.listaNegra());
  }

  /**
   * Pede um lote cobrindo os quatro níveis, e distribui por etiqueta.
   *
   * A chave de controle é `(tópico, forma)` e não inclui o nível: um pedido
   * traz os quatro de uma vez, então pedir de novo por causa de outro nível
   * seria pedir a mesma coisa duas vezes.
   */
  private async repor(
    topicoId: string,
    forma: string,
    declaracao: ProblemaDeTexto,
    modo: 'declarada' | 'reescrita',
  ): Promise<void> {
    const chaveDoPedido = `${topicoId}|${forma}`;

    if (this.emVoo().includes(chaveDoPedido) || !this.ligado() || !this.lote.valeTentarDeNovo()) {
      return;
    }

    this.emVoo.update((atuais) => [...atuais, chaveDoPedido]);

    try {
      const configuracao = this.configuracao();
      const pedido: PedidoDeProblema = {
        ...declaracao.pedido,
        niveis: NIVEIS,
        quantas: configuracao.lote,
        modo,
      };

      const lote = await this.lote.pedir(pedido, configuracao);
      const negras = new Set(this.listaNegra());
      const novas = lote.filter((modelo) => !negras.has(assinaturaDoModelo(modelo)));

      if (novas.length > 0) {
        this.filas.update((atuais) => {
          const copia: Record<string, readonly ModeloDeProblema[]> = { ...atuais };

          for (const modelo of novas) {
            const destino = chaveDe(topicoId, forma, modelo.nivel);
            copia[destino] = [...(copia[destino] ?? []), modelo];
          }

          return copia;
        });
        this.gravarCache();

        // O passo que faltava: quem chegou primeiro recebe a história agora.
        this.servirQuemEsperava();
      }
    } finally {
      this.emVoo.update((atuais) => atuais.filter((atual) => atual !== chaveDoPedido));
    }
  }

  /**
   * Veste os exercícios que apareceram antes do lote.
   *
   * Roda a cada lote que traz história. Não faz nada quando a lista de espera
   * está vazia — o caso comum depois do primeiro exercício de cada tópico.
   */
  private servirQuemEsperava(): void {
    const pendentes = this.esperando();
    const ids = Object.keys(pendentes);

    if (ids.length === 0) {
      return;
    }

    const filas = this.filas();
    const atribuidas: Record<string, ModeloDeProblema> = { ...this.atribuidas() };
    const restantes: Record<string, { readonly chave: string; readonly lacunas: number }> = {
      ...pendentes,
    };
    let mudou = false;

    for (const id of ids) {
      const espera = pendentes[id]!;
      const fila = filas[espera.chave] ?? [];
      const servem = fila.filter((modelo) => modelo.lacunas === espera.lacunas);

      if (servem.length === 0) {
        continue;
      }

      const escolhida = servem[0]!;
      atribuidas[id] = escolhida;
      delete restantes[id];
      mudou = true;
    }

    if (!mudou) {
      return;
    }

    /*
     * As filas são reconstruídas UMA vez, com todas as escolhas já feitas.
     * Retirar uma por uma, dentro do laço, faria a segunda escolha não
     * enxergar a primeira — duas histórias iguais vestiriam dois exercícios.
     */
    const escolhidas = new Set(
      Object.values(atribuidas).map((modelo) => assinaturaDoModelo(modelo)),
    );

    this.atribuidas.set(atribuidas);
    this.esperando.set(restantes);
    this.filas.update((atuais) =>
      Object.fromEntries(
        Object.entries(atuais).map(([chave, modelos]) => [
          chave,
          modelos.filter((modelo) => !escolhidas.has(assinaturaDoModelo(modelo))),
        ]),
      ),
    );
    this.gravarCache();
  }

  private gravarCache(): void {
    gravarCache(this.filas());
  }
}

function lerCache(): Readonly<Record<string, readonly ModeloDeProblema[]>> {
  try {
    const gravado = localStorage.getItem(CHAVE_DO_CACHE);

    if (gravado === null) {
      return {};
    }

    const lido = JSON.parse(gravado) as CacheGravado;

    // Leitura validada nó por nó: o que está no armazenamento do navegador não
    // é confiável só porque fomos nós que gravamos — versão antiga, aba de
    // outra origem, edição à mão.
    return Object.fromEntries(
      Object.entries(lido)
        .filter(([, modelos]) => Array.isArray(modelos))
        .map(([chave, modelos]) => [
          chave,
          modelos.filter(
            (modelo) =>
              typeof modelo?.pt === 'string' &&
              typeof modelo?.fr === 'string' &&
              typeof modelo?.en === 'string' &&
              Number.isInteger(modelo?.lacunas),
          ),
        ]),
    );
  } catch {
    return {};
  }
}

/**
 * Grava o cache, largando os tópicos mais antigos se não couber.
 *
 * Desistir de gravar porque o teto estourou foi o defeito que o rascunho teve
 * na primeira versão, e a persistência parava de funcionar no segundo tópico.
 */
function gravarCache(filas: Readonly<Record<string, readonly ModeloDeProblema[]>>): void {
  try {
    let chaves = Object.keys(filas);

    while (chaves.length > 0) {
      const recorte = Object.fromEntries(chaves.map((chave) => [chave, filas[chave]!]));
      const texto = JSON.stringify(recorte);

      if (new Blob([texto]).size <= LIMITE_DE_BYTES) {
        localStorage.setItem(CHAVE_DO_CACHE, texto);
        return;
      }

      chaves = chaves.slice(1);
    }

    localStorage.removeItem(CHAVE_DO_CACHE);
  } catch {
    // Aba privada, armazenamento cheio, permissão negada: o treino continua.
  }
}

function lerListaNegra(): readonly string[] {
  try {
    const gravado = localStorage.getItem(CHAVE_DA_LISTA_NEGRA);
    const lido = gravado === null ? [] : (JSON.parse(gravado) as unknown);

    return Array.isArray(lido) ? lido.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function gravarListaNegra(assinaturas: readonly string[]): void {
  try {
    localStorage.setItem(CHAVE_DA_LISTA_NEGRA, JSON.stringify(assinaturas.slice(-200)));
  } catch {
    // Sem armazenamento, o descarte vale só para esta sessão.
  }
}
