import axios from "axios";
import { useEffect, useState } from "react";
import DeleteProductModal from "../components/DeleteProductModal";
import Pagination from "../components/pagination";
import ProductModal from "../components/ProductModal";

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

function ProductPage({setIsAuth}){
    // 預設取得產品
    useEffect(()=>{
        getProducts();
    }, []);

    // 取得產品列表
    const getProducts = async (page=1) => {
        try {
        const res = await axios.get(`${baseUrl}/api/${apiPath}/admin/products?page=${page}`);
        setProducts(res.data.products);
        setPageInfo(res.data.pagination);
        } catch (error) {
        alert(error.response.data.message);
        }
    };

    // 自動檢查是否已登入
    useEffect(() => {
        const token = document.cookie.replace(
            // eslint-disable-next-line no-useless-escape
            /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
            "$1",
        );
        if (!token) {
            return;
        }
        axios.defaults.headers.common['Authorization'] = token;
        checkUserLogin();
    }, []);

    // 確認使用者是否已登入
    const checkUserLogin = async () => {
        try {
            await axios.post(`${baseUrl}/api/user/check`);
            setIsAuth(true);
        } catch (error) {
            alert(error.response.data.message);
            setIsAuth(false);
        }
    };
  
    // 產品列表狀態
    const [products, setProducts] = useState([]);

    // 頁面狀態
    const [pageInfo, setPageInfo] = useState({});
  
    // modal狀態為新增or編輯
    const [modalState, setModalState] = useState(null);
  
    // 產品modal狀態
    const [tempProduct, setTempProduct] = useState(defaultModalState);

    // 開啟modal，點編輯的話則帶入產品原先內容
    const openModal = (mod, product) => {
        setModalState(mod);
        if (mod === "add") {
        setTempProduct(defaultModalState);
        } else if (mod === "edit") {
        setTempProduct(product);
        }
        setIsProductModalOpen(true);
    };

    // 開啟刪除modal
    const openDeleteModal = (product) => {
        setTempProduct(product);
        setIsDeleteProductModalOpen(true);
    };

    // 控制開關DeleteProductModal
    const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);

    // 控制開關ProductModal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    return(
        <>
            <div className="container py-5">
                <div className="row">
                    <div className="col">
                    <div className="d-flex justify-content-between">
                        <h2>產品列表</h2>
                        <button type="button" className="btn btn-primary" onClick={() => { openModal("add") }}>新增產品</button>
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
                            <td>{product.is_enabled ? <span style={{ color: "green" }}>已啟用</span> : "未啟用 "}</td>
                            <td>
                                <div className="btn-group">
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { openModal("edit", product) }} >編輯</button>
                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openDeleteModal(product)}>刪除</button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                <Pagination getProducts={getProducts} pageInfo={pageInfo}/>
            </div>
            <ProductModal isProductModalOpen={isProductModalOpen} setIsProductModalOpen={setIsProductModalOpen} modalState={modalState} tempProduct={tempProduct} getProducts={getProducts}/>
            <DeleteProductModal isDeleteProductModalOpen={isDeleteProductModalOpen} setIsDeleteProductModalOpen={setIsDeleteProductModalOpen} tempProduct={tempProduct} getProducts={getProducts}/>
        </>
    )
}

export default ProductPage;