import navbar from "./navbar.js";

const Store = Vue.component("store", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container" style="margin-top: 20px;">
        <h2>Let's start shopping</h2>
        <body class="store-body">
        <div class="row">
          <div class="col-lg-9">
            <div class="input-group mb-3">
              <input v-model="searchKey" type="text" class="form-control" placeholder="Search by product name, price, or section">
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-search"></i> <!-- Bootstrap Icons search icon -->
                </span>
              </div>
            </div>
            <h4>Available Products</h4>
            <div class="row">
              <div v-for="product in filteredProducts" class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title" style="color: black;">{{ product.product_name }}</h5>
                    <p class="card-text" style="color: black;">Section: {{ product.section_name }}</p>
                    <p class="card-text" style="color: black;">Manufacturing Date: {{ product.manufacturingdate }}</p>
                    <p class="card-text" style="color: black;">Expiry Date: {{ product.expirydate }}</p>
                    <p class="card-text" style="color: black;">Available Quantity: {{ product.quantity }}</p>
                    <p class="card-text" style="color: black;">Rs. {{ product.price }}</p>
                    <template v-if="product.quantity > 0">
                      <form @submit.prevent="addToCart(product)">
                        <input v-model="product.quantityToAdd" type="number" min="1" class="form-control">
                        <button type="submit" class="btn btn-primary mt-2">Add to Cart</button>
                      </form>
                    </template>
                    <template v-else>
                      <button type="button" class="btn btn-secondary mt-2" disabled>Out Of Stock</button>  
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </div>
      <footer class="scrollable-footer">
      <div class="container">
        <p>Write to us at grocery@hotmail.com</p>
      </div>  
      </footer>
    </div>
  `,
  components: {
    navbar,
  },
  data() {
    return {
      searchKey: "",
      products: [],
    };
  },
  computed: {
    filteredProducts() {
      const searchKeyLC = this.searchKey.toLowerCase();
      return this.products.filter((product) => {
        return (
          product.product_name.toLowerCase().includes(searchKeyLC) ||
          product.section_name.toLowerCase().includes(searchKeyLC) ||
          product.price.toString().includes(searchKeyLC)
        );
      });
    },
  },
  methods: {
    fetchProducts() {
      fetch("/userproducts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Products data:", data);
          this.products = data;
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    },
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
  },
  created() {
    this.fetchProducts();
  },
});


export default Store;
