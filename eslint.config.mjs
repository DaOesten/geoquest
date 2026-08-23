import nextConfig from "eslint-config-next/core-web-vitals";

export default [
  ...nextConfig,
  {
    ignores: ["tests/**", "src/components/ui/**"],
  },
];
