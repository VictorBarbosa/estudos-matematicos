import { todosOsEnunciados, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { passosDoBanco } from '@core/enunciados/models/passos-do-banco';
import { avaliarLatex } from '@core/enunciados/models/regras-de-passos';

const ENTRADAS = todosOsEnunciados();
const ALVO = ['equacao-segundo-grau', 'expressoes-algebricas', 'fracoes', 'equacao-primeiro-grau', 'produtos-notaveis', 'juros-compostos', 'razao-proporcao'];

describe('diag', () => {
  it('algebra', () => {
    const linhas: string[] = [];
    for (const entrada of ENTRADAS) {
      if (!ALVO.includes(entrada.topico)) continue;
      const { total: _fora, ...dados } = entrada['dados-calculo'] ?? {};
      const texto = vestirTexto(entrada.enunciado.br, entrada['dados-calculo'] ?? {}, 'pt');
      const r = passosDoBanco(entrada.topico, dados, texto);
      const sub = r?.passos[1]?.tex;
      const resposta = Number(r?.valor);
      if (sub === undefined || !Number.isFinite(resposta)) continue;
      const m = avaliarLatex(sub);
      if (m === null || Math.abs(m - resposta) <= 0.02) continue;
      linhas.push(`${entrada.topico}: ${sub} => ${m} vs ${resposta}`);
    }
    expect(linhas.length, linhas.slice(0, 20).join('\n')).toBe(0);
  });
});
