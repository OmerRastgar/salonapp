import { createDirectus, rest, staticToken } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_TOKEN;

// .with() is immutable — chain it correctly so the token is actually applied
const directus = directusToken
  ? createDirectus(directusUrl || "").with(rest()).with(staticToken(directusToken))
  : createDirectus(directusUrl || "").with(rest());

export default directus;
