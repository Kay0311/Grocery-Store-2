import navbar from "./navbar.js";

const Checkout = Vue.component("checkout", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container" style="margin-top: 20px; margin-left: 20px">
        <h2>Payment Method</h2>
        <h3>Total Amount: Rs.{{ totalAmount }}</h3>
        <form @submit.prevent="placeOrder">
          <div class="form-group">
            <label for="payment_method">Select Payment Method:</label>
            <select v-model="selectedPaymentMethod" class="form-control" name="payment_method" id="payment_method">
              <option value="credit_card">Credit Card</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Place Order</button>
        </form>
      </div>
    </div>
  `,
  components: {
    navbar,
  },
  data() {
    return {
      totalAmount: 0,
      selectedPaymentMethod: "Cash_on_delivery",
    };
  },
  mounted() {
    this.totalAmount = this.$route.params.id;
  },
  methods: {
    placeOrder() {
      fetch("/checkout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.$router.push("/");
        })
        .catch((error) => console.error(error));
    },
  },
});

export default Checkout;
