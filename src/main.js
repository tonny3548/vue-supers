import Vue from 'vue'
import App from './App.vue'
import _ from "lodash";
import VueSuper from "./install";

Vue.config.productionTip = false
Vue.use(VueSuper)

new Vue({
  render: h => h(App),
}).$mount('#app')
