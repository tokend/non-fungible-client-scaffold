const merge = require('webpack-merge')
const env = require('./default.env')

module.exports = merge(env, {
  NODE_ENV: '"dev"',
  HORIZON_SERVER: '"http://localhost:8000"',
  FILE_STORAGE: '"http://localhost:9000/api"',
  NETWORK_PASSPHRASE: '"TokenD Developer Network"'
})
