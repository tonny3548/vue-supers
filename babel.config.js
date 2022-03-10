module.exports = {
    presets: [["@vue/app", { useBuiltIns: "entry" }]],
    plugins: [
        "@babel/plugin-proposal-optional-chaining", // ?.用法解析
        ["@babel/plugin-transform-modules-commonjs", { strictMode: false }], // 关闭es5-strict模式(需要先安装@babel/plugin-transform-modules-commonjs @babel/plugin-transform-strict-mode)
    ],
};
