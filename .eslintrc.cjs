module.exports = {
  extends: [require.resolve("@cyzeal/lint-config-lib/eslint-ts")],
  rules: {
    "@typescript-eslint/no-non-null-assertion": 0,
    "no-underscore-dangle": 0,
  },
}
