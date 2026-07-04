import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do projeto para o Turbopack. Sem isso o Next detecta o
  // package-lock.json da pasta pai e emite um aviso de "workspace root".
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
