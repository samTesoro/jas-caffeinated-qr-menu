import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore legacy/demo helper not used in build
  { ignores: ["components/admin/supabase-storage-upload.js"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Project overrides to reduce noise and unblock builds
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
      ],
    },
  },
];

export default eslintConfig;
