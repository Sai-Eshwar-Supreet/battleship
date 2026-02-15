module.exports = {
  printWidth: 100,

  overrides: [
    {
      files: ['**/*.js', '**/*.cjs'],
      options: {
        semi: true,
        singleQuote: true,
      },
    },
    {
      files: '**/*.json',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '**/*.js',
      options: {
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'always',
      },
    },
    {
      files: '**/*.html',
      options: {
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        htmlWhitespaceSensitivity: 'css',
        singleQuote: false,
      },
    },
  ],
};
