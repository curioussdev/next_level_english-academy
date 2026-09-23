/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove o indicador flutuante do Next.js (o botão "N") em todas as páginas durante o dev.
  devIndicators: false,
}

export default nextConfig
