import _ from "lodash";

/**
 * 查询混入后的扩展对象
 * @description 混入嵌套: 组件通过mixins和extend组合后的各个组件的混入嵌套关系
 * @description 组件配置: 组件通过mixins和extend组合后的总配置(比如会将所有父子混入的methods与computed组合后存放在options中)
 * @param {object} object vue实例对象
 * @returns {object} 函数组件对象
 */
function findExtend(object) {
    const mixin = object.__proto__.constructor;
    return {
        options: mixin.options,
        mixins: convertMixin(mixin),
    };
}

/**
 * 转换混入数组
 * @description Vue正常通过extend与mixins进行混入操作,两个方式在合并后的原型链结构是不相同的,此函数就是将两种不同的方式统一转换为mixins方式的混入方便统一解析操作
 * @param {object} mixin 原型混入对象
 * @param {[object]} [resultList] 存储结果的数组
 * @returns {[object]} 转换后的结果数组
 */
function convertMixin(mixin, resultList = []) {
    // 判断当前已处在组件对象中,直接追加
    if (mixin.cid === undefined) {
        resultList.unshift(mixin);
    } else {
        // 递归扩展配置
        if (mixin.extendOptions) {
            convertMixin(mixin.extendOptions, resultList);
        }
        // 递归超类对象(extend方式混入后父级混入会存在super中)
        if (mixin.super) {
            convertMixin(mixin.super, resultList);
        }
    }
    return resultList;
}

/**
 * 递归合并所有方法
 * @description 根据mixin嵌套集进行逆向遍历合并
 * @param {object} mixin 单个混入对象
 * @param {string} superName 目标组件的超类命名
 * @param {object} resultMethods 最终结果方法集
 * @param {object} options 记录查询状态
 * @param {boolean} options.isFindCurrentCmp 是否查询到了当前组件所处的对象(根据这个变量来进行综合判断目标函数是否为当前组件自带的)
 * @returns void
 */
function mergeMethods(
    mixin,
    superName,
    resultMethods,
    options = { isFindCurrentCmp: false }
) {
    const { methods, computed, mixins } = mixin;
    // 处在当前组件位置
    if (mixin.SUPER === superName) {
        // 重名判断
        if (options.isFindCurrentCmp === true) {
            console.warn(
                `组件出现重名super,这可能会导致调用父级混入方法出错!请确认~`,
                mixin
            );
        }
        options.isFindCurrentCmp = true;
    }
    // 已经查询到了当前组件,接下来所有的方法都是父级混入方法
    if (options.isFindCurrentCmp) {
        // methods合并
        _.forEach(methods, (method, methodName) => {
            // 第一次合并为: 调用的方法->直接略过并做标记
            if (resultMethods[methodName] === "methods") {
                resultMethods[methodName] = "methods_";
            }
            // 第二次合并: 父级混入方法
            else if (resultMethods[methodName] === "methods_") {
                resultMethods[methodName] = method.bind(this);
            }
        });
        // computed合并
        _.forEach(computed, (method, methodName) => {
            if (resultMethods[methodName] === "computed") {
                resultMethods[methodName] = "computed_";
            } else if (resultMethods[methodName] === "computed_") {
                resultMethods[methodName] = method.bind(this);
            }
        });
    }
    if (!_.isEmpty(mixins)) {
        // 遍历子混入查询合并父级混入方法
        for (let i = mixins.length - 1; i >= 0; i--) {
            mergeMethods.call(
                this,
                mixins[i],
                superName,
                resultMethods,
                options
            );
        }
        // 循环结束,递归出口
    }
}

export default {
    /**
     * 安装函数
     * @description 通过Vue.use(...)使用注入$super
     * @param {object} Vue vue对象
     * @returns void
     */
    install(Vue) {
        Vue.prototype.$super = this.super;
    },
    /**
     * 超类核心方法
     * @param {string} superName 超类名称(当前组件的唯一命名,必传)
     * @returns {object} 超类方法对象,包含了vm实例所有可执行的methos与computed的方法,即使没有父级,也会返回一个空的函数,并且可以被调用
     * @careful 当查询的方法为computed且没有父级方法,则空函数返回void
     * @careful 当查询的方法为methods方法且没有父级方法,则空函数返回Promise<void>,保证在异步函数调用this.$super(...).catch时不报错
     */
    super(superName) {
        // 参数验证
        if (!superName) {
            const err =
                "调用this.$super第一个参数必传,为当前组件对象的SUPER属性";
            console.error(err);
            throw new Error(err);
        }
        // 复用判断
        if (!this.superMethods___) {
            this.superMethods___ = {};
        }
        // 复用返回
        if (this.superMethods___[superName]) {
            return this.superMethods___[superName];
        }
        /** 混入函数对象 */
        const extend = findExtend(this);
        if (!extend) {
            console.warn(`未找到混入配置:${this.$options.name}`);
            return Promise.resolve();
        } else {
            const { methods: allMethods = {}, computed: allComputeds = {} } =
                extend.options;
            /** 结果集 */
            let resultMethods = {};
            // 遍历所有组件method配置,给结果集注入所有可以调用的方法
            _.forEach(allMethods, (fn, fname) => {
                resultMethods[fname] = "methods";
            });
            _.forEach(allComputeds, (fn, fname) => {
                resultMethods[fname] = "computed";
            });
            // 合并方法
            let options = { isFindCurrentCmp: false };
            for (let i = extend.mixins.length - 1; i >= 0; i--) {
                mergeMethods.call(
                    this,
                    extend.mixins[i],
                    superName,
                    resultMethods,
                    options
                );
            }
            // console.log(superName, JSON.stringify(resultMethods))
            // 空函数赋值
            _.forEach(resultMethods, (method, methodName) => {
                if (method === "methods" || method === "methods_") {
                    resultMethods[methodName] = (() => Promise.resolve()).bind(
                        this
                    );
                } else if (method === "computed" || method === "computed_") {
                    resultMethods[methodName] = (() => {}).bind(this);
                }
            });
            // 复用赋值
            this.superMethods___[superName] = resultMethods;
            return resultMethods;
        }
    },
};
