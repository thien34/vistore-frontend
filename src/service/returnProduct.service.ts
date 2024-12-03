import { OrderItemInfoPagingResponse, OrderItemInfoResponse, OrderPagingResponse, ReturnInvoicePagingResponse, ReturnInvoiceRequest, ReturnItemPagingResponse, ReturnItemRequest, ReturnRequest, ReturnRequestPagingResponse, ReturnItem, ReturnRequestRequest, PendingReturnProduct, PendingReturnProductRequest, ReStockQuantityProductRequest, ReturnTimeLineRequest, ProcessedReturnProductRequest } from "@/interface/returnProduct.interface"
import http from "@/libs/http"
import axios from "axios"

class ReturnProductService {
    private returnInvoicePath = '/api/admin/return-invoice'
    private returnItemPath = '/api/admin/return-item'
    private returnRequestPath = '/api/admin/return-request'
    private orderPath = '/api/admin/orders'
    private pictureReturnItemPath = '/api/admin/picture-return-product'
    private pendingReturnItemPath = '/api/admin/return-product/pending-return-item'
    private processedReturnItemPath = '/api/admin/return-product/processed-return-item'
    private returnTimeLinePath = '/api/admin/return-request/time-line'
    private reStockProductPath = '/api/admin/products/re-stock'
    async getAllReturnInvoice() {
        const response = await http.get<ReturnInvoicePagingResponse>(this.returnInvoicePath)
        return response;
    }

    async getAllReturnRequest() {
        const response = await http.get<ReturnRequestPagingResponse>(this.returnRequestPath)
        return response;
    }

    async getAllOrder() {
        const response = await http.get<OrderPagingResponse>(`${this.orderPath}/customer-orders`)
        return response;
    }

    async getAllReturnItem(returnRequestId: number) {
        const response = await http.get<ReturnItemPagingResponse>(`${this.returnItemPath}?returnRequestId=${returnRequestId}`)
        return response;
    }

    async getOrderItemByOrderId(orderId: number) {
        const response = await http.get<OrderItemInfoResponse[]>(`${this.orderPath}/${orderId}/order-items-summary`)
        return response;
    }

    async createPictureReturnProduct(file: File, returnItemId: number) {
        const formData = new FormData();
        formData.append('returnItemId', returnItemId.toString());
        formData.append('images', file);
        const response = await http.post(this.pictureReturnItemPath, formData)
        return response;
    }

    async createReturnRequest(returnRequest: ReturnRequestRequest) {
        const response = await http.post(this.returnRequestPath, returnRequest)
        return response;
    }

    async createReturnItem(returnItems: ReturnItemRequest[], returnRequestId: number) {
        if (returnItems.length === 0) {
            throw new Error("No items to return");
        }

        returnItems.forEach(item => {
            item.returnRequestId = returnRequestId;
        });

        const response = await http.post(this.returnItemPath, returnItems);
        return response;
    }

    async createPendingReturnItem(pendingReturnProduct: PendingReturnProductRequest[]) {
        const response = await http.post(this.pendingReturnItemPath, pendingReturnProduct)
        return response;
    }

    async createReturnInvoice(request: ReturnInvoiceRequest) {
        const response = await http.post(this.returnInvoicePath, request);
        if (response.status !== 200) {
            throw new Error('Failed to create return invoice');
        }
        return response;
    }

    async RestockProduct(reStockProduct: ReStockQuantityProductRequest[]) {
        const response = await http.post(this.reStockProductPath, reStockProduct)
        return response;
    }

    async createReturnTimeLine(returnTimeLine: ReturnTimeLineRequest) {
        const response = await http.post(this.returnTimeLinePath, returnTimeLine)
        return response;
    }

    async createAllReturnTimeLines(returnTimeLines: ReturnTimeLineRequest[]) {
        const response = await http.post(this.returnTimeLinePath, returnTimeLines)
        return response;
    }

    async getReturnTimeLine(returnRequestId: number) {
        const response = await http.get<ReturnTimeLineRequest[]>(`${this.returnTimeLinePath}?returnRequestId=${returnRequestId}`)
        return response;
    }

    async createProcessedReturnProduct(processedReturnProduct: ProcessedReturnProductRequest[]) {
        const response = await http.post(this.pendingReturnItemPath, processedReturnProduct)
        return response;
    }

}
const returnProductService = new ReturnProductService()
export default returnProductService