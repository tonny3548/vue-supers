<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" @click="test" />
        <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import Child from "../src/super/mixins/Child.vue";
import Child2 from "../src/super/mixins/Child2.vue";
const SUPER = "App";

export default {
    name: "App",
    mixins: [Child2, Child],
    SUPER,
    components: {
        HelloWorld,
    },
    computed: {
        appFormat() {
            return "format2";
        },
        parentFormat2() {
            return this.$super(SUPER).parentFormat2() + "app format";
        },
    },
    methods: {
        test() {
            this.$super(SUPER).test();
            console.log("superMethods", this.superMethods___);
            console.log("I am App method");
        },
        appTest() {
            console.log(this.$super(SUPER).appTest());
            console.log("I am AppTest");
        },
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
