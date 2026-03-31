import { createDirectus, rest, staticToken } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_TOKEN;

const directus = createDirectus(directusUrl || "").with(rest());

if (directusToken) {
  directus.with(staticToken(directusToken));
}

export default directus;
