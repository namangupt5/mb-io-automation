const common = {
  requireModule: ['ts-node/register'],
  require: ['src/hooks/hooks.ts', 'step-definitions/**/*.ts'],
  paths: ['features/**/*.feature'],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'allure-cucumberjs/reporter',
  ],
  formatOptions: {
    snippetInterface: 'async-await',
  },
  worldParameters: {
    stepTimeout: 60000,
  },
  retry: 2,
  retryTagFilter: '@flaky',
};

module.exports = {
  default: {
    ...common,
    parallel: 2,
  },
};
