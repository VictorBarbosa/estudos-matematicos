import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // O identificador do aplicativo no iPhone. Não leva nome de pessoa: ele
  // fica registrado na conta Apple e o repositório é público. Trocar obriga
  // a reinstalar, e o aplicativo antigo fica no aparelho até ser apagado.
  appId: 'com.estudosmatematicos.calculadora',
  appName: 'Calculadora',
  webDir: 'www',
  ios: {
    // A calculadora é escura; sem isto a faixa de rolagem elástica aparece
    // branca ao puxar a tela para baixo.
    backgroundColor: '#1c1c1e',
  },
};

export default config;
