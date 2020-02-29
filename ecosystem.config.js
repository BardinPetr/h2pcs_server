module.exports = {
  apps: [
    {
      name: "h2pcs",
      script: "server.js",
      env_production: {
        AUTH0_CLIENT_ID: "SToP1tvfsjE1EckPC00G2n3uAqJdRi58",
        AUTH0_DOMAIN: "deep-null.auth0.com",
        AUTH0_CLIENT_SECRET:
          "ZHlC1kQntwct-zMxFaieOsS1ONgY0dPIhX-ibplg_YwJnXFfmJcSoxIY27Cejyq7",
        AUTH0_CALLBACK_URL: "https://h2pcs.xyz/callback",
        IS_RELEASE: "true",
        PORT: 3777
      }
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa.pub",
      user: "deploy",
      host: ["212.109.197.144"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/master",
      repo: "git@github.com:BardinPetr/h2pcs_server.git",
      path: "/home/deploy/h2pcs",
      "pre-setup": "",
      "post-setup": "",
      "pre-deploy-local": "echo 'Deploy finished'",
      "post-deploy":
        "npm install; pm2 startOrRestart ecosystem.config.js; pm2 restart ecosystem.config.js --env production --update-env"
    }
  }
};
