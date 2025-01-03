export interface OrderRequest {
    customerId: number | null
    orderGuid: string
    addressType: number
    orderId: string
    pickupInStore: boolean
    orderStatusId: number
    paymentStatusId: number
    paymentMethodId: number
    paymentMode: number
    orderSubtotal: number
    orderSubtotalDiscount: number
    orderShipping: number
    orderDiscount: number
    orderTotal: number
    refundedAmount: number
    paidDateUtc: string
    orderItems: OrderItemRequest[]
    addressRequest: AddressRequest | null
    billCode: string
    deliveryMode: number
    idVouchers: number[]
    checkQuantity: boolean
}

export interface OrderItemRequest {
    productId: number
    orderItemGuid: string
    quantity: number
    unitPrice: number
    priceTotal: number
    discountAmount: number
    originalProductCost: number
    attributeDescription: string
    discountPrice: number | null
}

export interface AddressRequest {
    customerId: number | null
    firstName: string
    lastName: string
    email: string
    addressName: string
    provinceId: string
    districtId: string
    wardId: string
    phoneNumber: string
}

export enum PaymentMethodType {
    Cash = 0,
    BankTransfer = 1,
    Cod = 2
}
export enum PaymentStatusType {
    Pending = 0,
    Paid = 1,
    Cancelled = 2,
    CashOnDelivery = 3
}
export enum PaymentModeType {
    Online = 0,
    IN_STORE = 1
}

export enum OrderStatusType {
    CREATED = 0, // Mới tạo
    PENDING = 1, // Chờ xử lý
    CONFIRMED = 2, // Đã xác nhận
    SHIPPING_PENDING = 3, // Chờ vận chuyển
    SHIPPING_CONFIRMED = 4, // Đã xác nhận vận chuyển
    DELIVERING = 5, // Đang giao hàng
    DELIVERED = 6, // Đã giao hàng
    PAID = 7, // Đã thanh toán
    COMPLETED = 8, // Thành công
    CANCELLED = 9 // Đã hủy
}

export interface OrderResponse {
    id: number
    orderCode: string
    billCode: string
    customerName: string
    totalItem: number
    paidDateUtc: string
    orderStatus: number
    paymentStatus: number
    paymentMethod: number
    paymentMode: number
    customerId: number
    orderSubtotal: number
    orderTotal: number
    orderShippingTotal: number
    orderDiscountTotal: number
    orderSubtotalDiscount: number
}

export interface OrderFilter {
    name?: string
    paymentMode?: number
    status?: string
    startAmount?: number
    endAmount?: number
    paymentStatus?: number
    startDate?: Date
    endDate?: Date
}

export interface InvoiceData {
    orderCode: string
    invoiceNumber: string
    date: string
    dueDate: string
    company: Company
    client: Client
    items: Item[]
    subtotal: number
    discount: number
    total: number
    shipping: number
    isShipping: boolean
}

export interface Company {
    name: string
    logo: string
    address: string
    phone: string
    email: string
}

export interface Client {
    name: string
    address: string
    email: string
    phone: string
}

export interface Item {
    productName: string
    quantity: number
    rate: number
    amount: number
}
