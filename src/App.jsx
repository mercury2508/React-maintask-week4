import { useState } from "react";
import './App.css'
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";

function App() {
  // 登入狀態，預設為尚登入(false)，以三元運算子控制顯示的頁面(停留在登入畫面)
  const [isAuth, setIsAuth] = useState(false);

  return (
    <>
      {isAuth ? <ProductPage setIsAuth={setIsAuth}/> : <LoginPage setIsAuth={setIsAuth}/>}
    </>
  )
}

export default App