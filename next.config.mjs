/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    // Permite imagens base64 do QR Code
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  async redirects() {
    return [
      // Redireciona /carrinho para /servicos (não usamos mais o carrinho)
      {
        source:      '/carrinho',
        destination: '/servicos',
        permanent:   false,
      },
    ];
  },
};

export default nextConfig;
