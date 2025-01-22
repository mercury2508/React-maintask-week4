// import axios from "axios";
// import { Modal } from 'bootstrap';
import { useState } from "react";
import './App.css'
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
// const baseUrl = import.meta.env.VITE_BASE_URL;
// const apiPath = import.meta.env.VITE_API_PATH;

function App() {
  // 登入狀態，預設為尚登入(false)，以三元運算子控制顯示的頁面(停留在登入畫面)
  const [isAuth, setIsAuth] = useState(false);

  // // 產品列表狀態
  // const [products, setProducts] = useState([]);

  // // 頁面狀態
  // const [pageInfo, setPageInfo] = useState({});

  return (
    <>
      {isAuth ? <ProductPage setIsAuth={setIsAuth}/>
        : <LoginPage setIsAuth={setIsAuth}/>
      }
    </>
  )
}

export default App
