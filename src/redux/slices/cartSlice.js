import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Helper function to ensure two decimal places in prices
const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

// Get cart data from cookies or initialize an empty cart
const initialCartData = Cookies.get('cart')
  ? { ...JSON.parse(Cookies.get('cart')), loading: true }
  : {
      loading: true,
      cartItems: [],
      shippingAddress: {},
      paymentMethod: '',
    };

// Create a cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartData,
  reducers: {
    addToCart: (state, action) => {
      const itemToAdd = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === itemToAdd.id);
      
      if (existingItem) {
        existingItem.qty += itemToAdd.qty;
        if(existingItem.qty<=1) existingItem.qty=1;
      } else {
        state.cartItems.push(itemToAdd);
      }
      
      // Recalculate prices
      const { cartItems } = state;
      state.itemsPrice = addDecimals(cartItems.reduce((total, item) => total + item.price * item.qty, 0));
      state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 100);
      state.taxPrice = addDecimals(0.15 * state.itemsPrice);
      state.totalPrice = addDecimals(state.itemsPrice + state.shippingPrice + state.taxPrice);
      
      // Save cart data in cookies
      Cookies.set('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      const itemIdToRemove = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== itemIdToRemove);
      
      // Recalculate prices
      const { cartItems } = state;
      state.itemsPrice = addDecimals(cartItems.reduce((total, item) => total + item.price * item.qty, 0));
      state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 100);
      state.taxPrice = addDecimals(0.15 * state.itemsPrice);
      state.totalPrice = addDecimals(state.itemsPrice + state.shippingPrice + state.taxPrice);
      
      // Save cart data in cookies
      Cookies.set('cart', JSON.stringify(state));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      Cookies.set('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      Cookies.set('cart', JSON.stringify(state));
    },
    hideLoading: (state) => {
      state.loading = false;
    },
  },
});

// Export actions and reducer
export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  hideLoading,
} = cartSlice.actions;

export default cartSlice.reducer;
