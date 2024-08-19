import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.testapp',
  appName: 'testapp',
  webDir: 'www',
  "server": {
    "androidScheme": "http"
  }
};

export default config;
