import navbar from "./navbar.js";

const Cart = Vue.component("cart", {
  template: `
  <div>
  <navbar></navbar>
  <div class="container">
  <h3>Cart</h3>
  <ul class="list-group" v-if="cartItems.length > 0">
    <li v-for="cartItem in cartItems" class="list-group-item d-flex justify-content-between align-items-center" style="color: black;">
      {{ cartItem.quantity }} x {{ cartItem.product_name }} - Rs. {{ cartItem.price }}
      <button @click="removeFromCart(cartItem)" class="btn btn-danger btn-sm">Remove</button>
    </li>
  </ul>
  <p v-else>Your cart looks empty.</p>
  <form @submit.prevent="checkout">
    <button type="submit" class="btn btn-primary mt-3">Checkout</button>
  </form>
  </div>
</div>
  `,
  components: {
    navbar,
  },
  data() {
    return {
      cartItems: [],
    };
  },
  methods: {
    addToCart(product) {
      if (
        product.quantityToAdd > 0 &&
        product.quantityToAdd <= product.quantity
      ) {
        fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            product_id: product.product_id,
            quantity: product.quantityToAdd,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            alert(data.message);
            this.fetchProducts();
            this.fetchCartItems();
          })
          .catch((error) => console.error(error));
      }
    },
    removeFromCart(cartItem) {
      fetch(`/api/cart/${cartItem.cart_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.fetchCartItems();
        })
        .catch((error) => console.error(error));
    },
    checkout() {
      const data = {
        total_amount: 0,
      };
      for (let i = 0; i < this.cartItems.length; i++) {
        data.total_amount +=
          this.cartItems[i].price * this.cartItems[i].quantity;
      }
      this.$router.push("/checkout/" + data.total_amount);
    },
    fetchCartItems() {
      fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Cart items:", data);
          this.cartItems = data;
        });
    },
  },
  created() {
    this.fetchCartItems();
  },
});

export default Cart;
