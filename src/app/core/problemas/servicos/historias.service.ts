import { Injectable, computed, inject, signal } from '@angular/core';
import { Idioma } from '@core/i18n/models/i18n.model';
import { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';
import { PedidoDeProblema } from '@core/problemas/prompt/montar-prompt';
import {
  CONFIGURACAO_PADRAO,
  ConfiguracaoDaLlm,
  LlmService,
} from '@core/problemas/servicos/llm.service';
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

const CHAVE_DO_CACHE = 'estudos-matematicos.problemas.v1';
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

/** Quantas histórias na fila antes de pedir mais. */
const PISO_DA_FILA = 3;

interface CacheGravado {
  readonly [chave: string]: readonly ModeloDeProblema[];
}

@Injectable({ providedIn: 'root' })
export class HistoriasService {
  private readonly llm = inject(LlmService);

  private readonly configuracao = signal<ConfiguracaoDaLlm>(CONFIGURACAO_PADRAO);

  /** A fila por chave. Nasce do cache e cresce com o que a LLM traz. */
  private readonly filas =
    signal<Readonly<Record<string, readonly ModeloDeProblema[]>>>(lerCache());

  /** As histórias que o aluno marcou como erradas, por assinatura. */
  private readonly listaNegra = signal<readonly string[]>(lerListaNegra());

  /** Que história está vestindo cada exercício, pelo id dele. */
  private readonly atribuidas = signal<Readonly<Record<string, ModeloDeProblema>>>({});

  /** Chaves cujo lote está sendo pedido agora, para não pedir duas vezes. */
  private readonly pedindo = new Set<string>();

  /** Ligado quando há endereço configurado e as tentativas não desistiram. */
  readonly ligado = signal(true);

  /** Verdadeiro enquanto o primeiro lote de um tópico não chegou. */
  readonly preparando = computed(() => this.llm.pedindo());

  definirConfiguracao(configuracao: ConfiguracaoDaLlm): void {
    this.configuracao.set(configuracao);
  }

  /** Esquece as falhas ao entrar noutro tópico. */
  recomecar(): void {
    this.llm.recomecar();
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
    }

    if ((this.filas()[chave] ?? []).length < PISO_DA_FILA) {
      void this.repor(chave, nivel, declaracao);
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

  private async repor(chave: string, nivel: string, declaracao: ProblemaDeTexto): Promise<void> {
    if (this.pedindo.has(chave) || !this.ligado() || !this.llm.valeTentarDeNovo()) {
      return;
    }

    this.pedindo.add(chave);

    try {
      const configuracao = this.configuracao();
      const pedido: PedidoDeProblema = {
        ...declaracao.pedido,
        nivel: nivel as PedidoDeProblema['nivel'],
        quantas: configuracao.lote,
      };

      const lote = await this.llm.pedirLote(pedido, configuracao);
      const negras = new Set(this.listaNegra());
      const novas = lote.filter((modelo) => !negras.has(assinaturaDoModelo(modelo)));

      if (novas.length > 0) {
        this.filas.update((atuais) => ({
          ...atuais,
          [chave]: [...(atuais[chave] ?? []), ...novas],
        }));
        this.gravarCache();
      }
    } finally {
      this.pedindo.delete(chave);
    }
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
