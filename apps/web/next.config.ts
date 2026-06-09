import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Internal packages are consumed as TypeScript source (Turborepo JIT packages),
  // so Next transpiles them at build time. See docs/adr/004-monorepo-tooling.md.
  transpilePackages: [
    "@drum-notes/core",
    "@drum-notes/notation-engine",
    "@drum-notes/ui",
  ],
  // Linting is a dedicated Turborepo task (`pnpm lint`) using the central
  // flat config, so the build does not run its own lint pass.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
