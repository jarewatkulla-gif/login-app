import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Ship the members-only slideshow page with the server bundle.
  outputFileTracingIncludes: { "/slideshow": ["./private/**"] },
};

export default nextConfig;
