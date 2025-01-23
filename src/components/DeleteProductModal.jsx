import axios from "axios";
import { Modal } from 'bootstrap';
import { useEffect, useRef } from "react";
const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;

function DeleteProductModal({isDeleteProductModalOpen, tempProduct, getProducts}){
    
    // 刪除modal
    const deleteProductModalRef = useRef(null);
    const deleteModalRef = useRef(null);
    useEffect(() => {
    deleteModalRef.current = new Modal(deleteProductModalRef.current);
    }, []);

    // 控制刪除modal開關
    useEffect(()=>{
        if(isDeleteProductModalOpen){
            deleteModalRef.current.show();
        }
    }, [isDeleteProductModalOpen]);

    // 關閉刪除modal
    const closeDeleteModal = () => {
        deleteModalRef.current.hide();
    };

    // 刪除產品
    const deleteProduct = async () => {
        try {
        await axios.delete(`${baseUrl}/api/${apiPath}/admin/product/${tempProduct.id}`)
        closeDeleteModal();
        getProducts();
        } catch (error) {
        alert(error);
        }
    };

    return(
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
    )
}

export default DeleteProductModal;