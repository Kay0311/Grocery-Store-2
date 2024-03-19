import Home from "./components/home.js";
import Store from "./components/store.js";
import login from "./components/login.js";
import register from "./components/register.js";
import profile from "./components/profile.js";
import adminDashboard from "./components/admindashboard.js";
import managerDashboard from "./components/managerdashboard.js";
import request from "./components/request.js";
import Checkout from "./components/checkout.js";
import cart from "./components/cart.js";

const routes = [
  {
    path: "/",
    component: Store,
  },
  {
    path: "/admin",
    component: adminDashboard,
  },
  {
    path: "/manager",
    component: managerDashboard,
  },
  {
    path: "/login",
    component: login,
  },
  {
    path: "/profile",
    component: profile,
  },
  {
    path: "/request",
    component: request,
  },
  {
    path: "/cart",
    component: cart,
  },

  // {
  //   path: "/admin",
  //   name: "Admin",
  //   component: Admin,
  // },
  // {
  //   path: "/",
  //   name: "User",
  //   component: User,
  // },
  {
    path: "/register",
    component: register,
  },
  {
    path: "/checkout/:id",
    component: Checkout,
  },
];
const router = new VueRouter({
  routes,
});
export default router;
