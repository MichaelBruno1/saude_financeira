export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "writable",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        alert: "readonly",
        confirm: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        App: "writable",
        Chart: "readonly",
        fetch: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
