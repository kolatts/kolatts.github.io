import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://kolatts.github.io',
  output: 'static',
  integrations: [icon()],
});
