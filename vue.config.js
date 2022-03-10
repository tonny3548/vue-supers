const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    publicPath: "./",
    transpileDependencies: true,
    configureWebpack: {
        resolve: {
            alias: {
                path: false,
                stream: false,
            },
        },
    },
});
