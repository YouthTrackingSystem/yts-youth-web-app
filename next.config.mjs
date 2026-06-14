import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable:
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PWA_ENABLED === "false",
  register: true,
  skipWaiting: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/youth-proxy/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/:path*`
      }
    ];
  }
};

export default withPWA(nextConfig);
