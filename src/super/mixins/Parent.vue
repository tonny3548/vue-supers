<script>
import _ from "lodash";
const SUPER = "Parent";

export default {
    name: "VueTestParent",
    super: SUPER,
    data() {
        return {
            counts: {},
        };
    },
    mounted() {},
    computed: {
        parentFormat() {
            return "I am Parent computed";
        },
    },
    methods: {
        test() {
            this.$super(SUPER).test();
            console.log("I am Parent method");
        },
        parentTest() {
            console.log("I am Parent test2 method");
        },
    },
};
</script>