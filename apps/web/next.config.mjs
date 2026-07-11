/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@incidentmind/shared',
    '@incidentmind/ui',
    '@incidentmind/agents',
    '@incidentmind/tools',
    '@incidentmind/prompts',
  ],
  // Standalone output is friendlier for containerized deploys later.
  // Leave disabled while developing locally.
  output: undefined,
};

export default nextConfig;
