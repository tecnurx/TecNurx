/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dz465qhb9/**",
      },
      // You can add more patterns if you have other domains
    ],
  },
};

export default nextConfig;
