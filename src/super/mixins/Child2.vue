<script>
const SUPER = "Child2";

export default {
    name: "VueTestChild2",
    SUPER,
    methods: {
        test() {
            this.$super(SUPER).test();
            console.log("I am Child2 test");
        },
    },
};
</script>