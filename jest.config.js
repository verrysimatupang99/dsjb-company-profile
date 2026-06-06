module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!html-encoding-sniffer|@exodus/bytes)"
  ]
};
