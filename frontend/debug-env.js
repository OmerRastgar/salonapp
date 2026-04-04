// Debug script to check current environment variables
console.log('=== Frontend Environment Variables ===');
console.log('NEXT_PUBLIC_DIRECTUS_URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
console.log('DIRECTUS_INTERNAL_URL:', process.env.DIRECTUS_INTERNAL_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check if we're on server or client
const isServer = typeof window === 'undefined';
console.log('Running on:', isServer ? 'SERVER' : 'CLIENT');

if (!isServer) {
  console.log('Window location origin:', window.location.origin);
  console.log('Full window location:', window.location.href);
}
