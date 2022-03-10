# vue-test

## 基本介绍

`vue-extends`是一个针对`vue2.x`进行补充的插件,实现面向对象中的super关键字功能,能够在多级混入中随时可以在函数内部调用父级混入的方法,从而实现面向对象式的继承与多态

适用于vue脚手架项目与单文件式编程

注意: 只能在`methods`与`computed`中使用

## 安装

```bash
npm i vue-supers --save
```

## 测试

```bash
npm run serve
```

## 使用

> 注意:` $super`的第一个参数不能少,且必须是全局唯一,并且组件需要有`SUPER`属性
>
> 当`SUPER`不确定是否全局唯一时, 可以先运行, 重复时会出现警告信息

### 实例注册

*main.javascript*

```javascript
import Vue from "vue";
import VueSuper from "vue-supers";

Vue.use(VueSuper);
```

### 实例1: 正常使用

*父组件`Parent.vue`*

```vue
<script>
export default {
  name: "parent",
  computed: {
    format() {
      return "Parent Computed format"
    }
  },
  methods: {
    test() {
      console.log("I am Parent test Method");
    }
  }
}
</script>
```

*子组件`Child.vue`*

```vue
<script>
import Parent from "./Parent.vue";
  
const SUPER = "Child";
  
export default {
  SUPER,
  name: "child",
  mixins: [Parent],
  computed: {
    format() {
      const parentRes = this.$super(SUPER).format();
      return parentRes + ", Child Computed format"
    }
  },
  methods: {
    test() {
      this.$super(SUPER).test();
      console.log("I am Child test Method");
    }
  }
}
</script>
```

*运行输出*

```javascript
import Child from "./Child.vue";

const vm = new Child();
vm.test();
console.log(vm.format);
// 输出
"I am Parent test Method"
"I am Child test Method"
"Parent Computed format, Child Computed format"
```

### 实例2: 空结果调用

> 当出现当前重写方法时, 不确定父级是否含有同名方法, 有就调用, 没有就空调用的情况
>
> 也可以使用`vue-supers`来直接调用父级方法, 不管父级有没有方法,函数都能够被正常调用
>
> 因为使用`this.$super(SUPER)`时始终会调用成功

```javascript
const Parent = Vue.extend({
  SUPER: "Parent",
  methods: {
    test() {
      // 此处调用不会报错
      this.$super("Parent").test();
    }
  }
});
```

> 在`methods`中使用`this.$super`时, 如果父级为空, 则会返回一个`Promise`对象, 这样在异步父级调用时直接使用`.catch`时不会报错
>
> 但是在`computed`中使用时,如果父级为空,则只会返回`undefined`

```javascript
const Parent = Vue.extend({
  SUPER: "Parent",
  computed: {
    format() {
      return this.$super("Parent").format() + " Parent Computed";
		}
  }
  methods: {
    async test() {
      // 此处调用不会报错
      await this.$super("Parent").test().catch(err => console.error(err))
      // dosomething
    }
  }
});

console.log(new Parent().format);
// 输出
"undefined Parent Computed"
```
