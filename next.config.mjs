/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Benarkan logo sekolah dimuat naik dari Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
