import axios from "axios";
import { Modal } from 'bootstrap';
import { useEffect, useRef, useState } from "react";
import './App.css'
const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {
  // 帳密狀態
  const [account, setAccount] = useState({
    username: "",
    password: ""
  });

  // 取得帳號密碼
  const getInputValue = (event) => {
    const { name, value } = event.target;
    setAccount({
      ...account,
      [name]: value,
    })
  }

  // 登入狀態，預設為尚登入(false)，以三元運算子控制顯示的頁面(停留在登入畫面)
  const [isAuth, setIsAuth] = useState(false);

  // 登入功能
  const loginButton = (event) => {
    event.preventDefault();
    (async () => {
      try {
        const res = await axios.post(`${baseUrl}/admin/signin`, account);
        const { token, expired } = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date({ expired })}`;
        setIsAuth(true);
        axios.defaults.headers.common['Authorization'] = token;
        getProducts();
      } catch (error) {
        alert(error.response.data?.error?.message)
      }
    })()
  }

  // 取得產品
  const getProducts = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/${apiPath}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  // 產品列表狀態
  const [products, setProducts] = useState([]);

  // 確認使用者是否已登入
  const checkUserLogin = async () => {
    try {
      await axios.post(`${baseUrl}/api/user/check`);
      alert("使用者已成功登入");
      setIsAuth(true);
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
      setIsAuth(false);
    }
  }
  // 自動檢查是否已登入
  useEffect(()=>{
    const token = document.cookie.replace(
      // eslint-disable-next-line no-useless-escape
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    if(!token){
      return;
    }
    axios.defaults.headers.common['Authorization'] = token;
    checkUserLogin();
  }, [])

  const productModalRef = useRef(null);
  const modalRef = useRef(null);
  // 新增編輯產品modal 渲染後才能取得DOM
  useEffect(()=>{
    modalRef.current = new Modal(productModalRef.current);
  }, [])
  
  // modal狀態為新增or編輯
  const [modalState, setModalState] = useState(null);
  
  // 開啟modal，點編輯的話則帶入產品原先內容
  const openModal = (mod, product) =>{
    setModalState(mod);
    if(mod === "add"){
      setTempProduct(defaultModalState);
    }else if(mod === "edit"){
      setTempProduct(product);
    }
    modalRef.current.show();
  }

  // 關閉modal
  const closeModal = () =>{
    modalRef.current.hide();
  }

  // 產品modal狀態
  const [tempProduct, setTempProduct] = useState(defaultModalState);

  // 撰寫產品modal (需確認name的type是否為checkbox)
  const handleProductContent = (e) =>{
    const { name, value, checked, type } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value
    })
  };

  // 刪除modal
  const deleteProductModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  useEffect(()=>{
    deleteModalRef.current = new Modal(deleteProductModalRef.current);
  }, [])

  // 開啟刪除modal
  const openDeleteModal = (product) =>{
    setTempProduct(product);
    deleteModalRef.current.show();
  };

  // 關閉刪除modal
  const closeDeleteModal = () =>{
    deleteModalRef.current.hide();
  };

  // 調整副圖
  const handleImageChange = (e, index) =>{
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    })
  };

  // 新增附圖button
  const handleAddImages = () =>{
    const newImages = [...tempProduct.imagesUrl];
    newImages.push("");
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    })
  };

  //刪除副圖button
  const handleRemoveImages = () =>{
    const newImages = [...tempProduct.imagesUrl];
    newImages.pop();
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    })
  };

  // 新增產品
  const addNewProduct = async() =>{
    try {
      const productData = {
        data:{
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0
        }
      }
      await axios.post(`${baseUrl}/api/${apiPath}/admin/product`, productData)
      alert("新增產品成功");
    } catch (error) {
      alert(`欄位尚未填寫:${error.response.data.message}`);
    }
  };

  // 修改產品
  const adjustProduct = async() =>{
    try {
      const productData = {
        data:{
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0
        }
      }
      await axios.put(`${baseUrl}/api/${apiPath}/admin/product/${tempProduct.id}`, productData)
      alert("已編輯產品");
    } catch (error) {
      alert(error);
    }
  };

  // 送出新增產品
  // 使用modalState狀態判斷該送出新增or編輯HTTP請求
  const handleUpdateProduct = async() =>{
    const apiCall = modalState === "add" ? addNewProduct : adjustProduct;
    try {
      await apiCall();
      getProducts();
      closeModal();
    } catch (error) {
      alert(error);
    }
  };

  // 刪除產品
  const deleteProduct = async() =>{
    try {
      await axios.delete(`${baseUrl}/api/${apiPath}/admin/product/${tempProduct.id}`)
      closeDeleteModal();
      getProducts();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      {isAuth ?
        <div className="container py-5">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-between">
                <h2>產品列表</h2>
                <button type="button" className="btn btn-primary" onClick={()=>{openModal("add")}}>新增產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">編輯商品</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? <span style={{color: "green"}}>已啟用</span> : "未啟用 "}</td>
                      <td>
                        <div className="btn-group">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>{openModal("edit", product)}} >編輯</button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>openDeleteModal(product)}>刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> :
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form className="d-flex flex-column gap-3" onSubmit={loginButton} >
            <div className="form-floating mb-3">
              <input type="email" name="username" value={account.username} className="form-control" id="username" placeholder="name@example.com" onChange={getInputValue} />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input type="password" name="password" value={account.password} className="form-control" id="password" placeholder="Password" onChange={getInputValue} />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      }
      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalState==="add"? "新增產品" : "編輯產品"}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={tempProduct.imageUrl}
                        onChange={handleProductContent}
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                          value={image}
                          onChange={(e)=>handleImageChange(e, index)}
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length-1] !=="" && (<button className="btn btn-outline-primary btn-sm w-100" onClick={handleAddImages}>新增圖片</button>)}
                      {tempProduct.imagesUrl.length > 1 && (<button className="btn btn-outline-danger btn-sm w-100" onClick={handleRemoveImages} >取消圖片</button>)}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={tempProduct.title}
                      onChange={handleProductContent}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                      value={tempProduct.category}
                      onChange={handleProductContent}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                      value={tempProduct.unit}
                      onChange={handleProductContent}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={tempProduct.origin_price}
                        onChange={handleProductContent}
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={tempProduct.price}
                        onChange={handleProductContent}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                      value={tempProduct.description}
                      onChange={handleProductContent}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                      value={tempProduct.content}
                      onChange={handleProductContent}
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                      checked={tempProduct.is_enabled}
                      onChange={handleProductContent}
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                取消
              </button>
              <button type="button" className="btn btn-primary" onClick={handleUpdateProduct}>
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={deleteProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeDeleteModal}
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除 
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteModal}
              >
                取消
              </button>
              <button type="button" className="btn btn-danger" onClick={deleteProduct}>
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
