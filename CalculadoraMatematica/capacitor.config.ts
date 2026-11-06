import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // O identificador do aplicativo no iPhone. Trocar depois obriga a
  // reinstalar, então ele já nasce com o nome definitivo.
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
