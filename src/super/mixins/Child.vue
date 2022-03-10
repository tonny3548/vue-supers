<script>
import Parent from "./Parent.vue";

const SUPER = "Child";

export default {
    name: "VueTestChild",
    SUPER,
    mixins: [Parent],
    data() {
        return {};
    },
    methods: {
        test() {
            this.$super(SUPER).test();
            console.log("I am Child method");
        },
    },
};
</script>