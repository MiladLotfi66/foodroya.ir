"use client";
import { Provider } from "react-redux";
import store from "./Store";

function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>
}

export default Providers
