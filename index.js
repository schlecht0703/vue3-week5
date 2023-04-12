const apiUrl = 'https://vue3-course-api.hexschool.io/';
const path = 'schlecht0703';

VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);

Object.keys(VeeValidateRules).forEach((rule) => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});

VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
    data() {
        return {
            products: [],
            productId: '',
            cart: [],
            cartStatus: false,
            isLoading: false,
            loadingStatus: {
                loadingItem: '',
                isLoading: false,
            },
            user: {
                email: '',
                name: '',
                tel: '',
                address: '',
            },
            message: '',

        };
    },
    methods: {
        getProduct() {
            axios
                .get(`${apiUrl}v2/api/${path}/products/all`)
                .then((res) => {
                    this.products = res.data.products;
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        openModal(id) {
            this.productId = id;
        },
        closeModal() {
            (this.productId = ''), this.$refs.productModal.hideModal();
        },
        clearLoadingStatus() {
            this.loadingStatus.loadingItem = '';
            this.loadingStatus.isLoading = false;
        },
        addToCart(product_id, qty = 1) {
            this.loadingStatus.loadingItem = product_id;
            this.loadingStatus.isLoading = true;
            const data = {
                product_id,
                qty,
            };
            axios
                .post(`${apiUrl}v2/api/${path}/cart`, { data })
                .then((res) => {
                    alert(res.data.message);
                    this.productId = '';
                    this.$refs.productModal.hideModal();
                    this.clearLoadingStatus();
                    this.getCartList();
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        getCartList() {
            axios
                .get(`${apiUrl}v2/api/${path}/cart`)
                .then((res) => {
                    this.cart = res.data.data;
                    if (this.cart.carts.length === 0) {
                        this.cartStatus = false;
                    } else {
                        this.cartStatus = true;
                    }
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        changeQty(id, product_id, qty) {
            const data = {
                product_id,
                qty,
            };
            axios
                .put(`${apiUrl}v2/api/${path}/cart/${id}`, { data })
                .then((res) => {
                    this.getCartList();
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        removeCartItem(id) {
            this.loadingStatus.loadingItem = id;
            this.loadingStatus.isLoading = true;
            axios
                .delete(`${apiUrl}v2/api/${path}/cart/${id}`)
                .then((res) => {
                    alert(`已刪除購物車品項`);
                    this.getCartList();
                    this.clearLoadingStatus();
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        removeAllCart() {
            axios
                .delete(`${apiUrl}v2/api/${path}/carts`)
                .then((res) => {
                    alert(`已清空購物車`);
                    this.getCartList();
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/;
            return phoneNumber.test(value) ? true : '需要正確的手機號碼';
        },
        onSubmit() {
            const data = {
                user: this.user,
                message: this.message,
            };
            if (this.cart.carts.length === 0) {
                alert('購物車內還沒有商品唷～');
                return;
            }
            axios
                .post(`${apiUrl}v2/api/${path}/order`, { data })
                .then((res) => {
                    alert(res.data.message);
                    this.$refs.form.resetForm();
                    this.message = '';
                    this.getCartList();
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
    },
    mounted() {
        this.getProduct();
        this.getCartList();
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false
        }, 3000)
    },
});
app.component('productModal', {
    props: ['id', 'addToCart', 'loadingStatus', 'closeModal'],
    data() {
        return {
            productModal: '',
            selectProduct: '',
            modalQty: 1,
        };
    },
    methods: {
        hideModal() {
            this.modalQty = 1;
            this.productModal.hide();
        },
    },
    watch: {
        id() {
            if (this.id) {
                axios
                    .get(`${apiUrl}v2/api/${path}/product/${this.id}`)
                    .then((res) => {
                        this.selectProduct = res.data.product;
                        this.productModal.show();
                    })
                    .catch((err) => {
                        alert(err.data.message);
                    });
            }
        },
    },
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal, {
            keyboard: false,
        });
    },
    template: '#userProductModal',
});
app.component('loading', VueLoading.Component)
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.use(VueLoading.LoadingPlugin);
app.mount('#app');