import nextConfig from "eslint-config-next";

const eslintConfig = [...nextConfig, { ignores: ["ref/**"] }];

export default eslintConfig;
