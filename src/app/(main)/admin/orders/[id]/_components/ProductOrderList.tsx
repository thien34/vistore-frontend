import React, { useEffect, useRef, useState } from 'react'
import { OrderItemsResponse } from '@/interface/orderItem.interface'
import { InputNumber } from 'primereact/inputnumber'
import Image from 'next/image'
import OrderService from '@/service/order.service'
import { useMountEffect } from 'primereact/hooks'
import { Toast } from 'primereact/toast'
import { OrderStatusType } from '@/interface/order.interface'
import { ProductResponse } from '@/interface/Product'
import ProductDialog from '../../../retail/_components/ProductDialog'
import ProductService from '@/service/ProducrService'

interface ProductAttribute {
    productAttribute: {
        name: string
    }
    id: number
    name: string
    value: string
}

interface Product {
    id: number
    name: string
    unitPrice: number
    discountPrice?: number
    quantity: number
    attributes: ProductAttribute[] | null
    largestDiscountPercentage: number
    cartUUID: string
    imageUrl: string
}

type Props = {
    onDelete: (cartUUID: string) => void
    onUpdateQuantity: (id: number, quantity: number) => void
    id: string
    status: OrderStatusType
}

export default function ProductOrderList({ id }: Props) {
    const [products, setProducts] = useState<Product[]>([])
    const [orderItemsResponse, setOrderItemsResponse] = useState<OrderItemsResponse[]>([])
    const [visible, setVisible] = useState(false)
    const [filters, setFilters] = useState({})
    const [globalFilterValue, setGlobalFilterValue] = useState('')
    const [productsDialog, setProductsDialog] = useState<ProductResponse[]>([])

    const toast = useRef<Toast>(null)
    const fetchProducts = async () => {
        OrderService.getOrderItems(id).then((response) => {
            setOrderItemsResponse(response.payload)
        })
    }
    const fetchProductsDialog = () => {
        ProductService.getProuctsDetails().then((res) => setProductsDialog(res))
    }
    useMountEffect(() => {
        fetchProducts()
        fetchProductsDialog()
    })

    useEffect(() => {
        const data: Product[] = orderItemsResponse.map((item) => {
            const product = JSON.parse(item.productJson)
            return {
                id: product.id,
                name: product.name,
                unitPrice: product.unitPrice,
                discountPrice: product.discountPrice,
                quantity: item.quantity,
                attributes: product.productAttributeValues.map((attr: ProductAttribute) => ({
                    id: attr.id,
                    name: attr.productAttribute.name,
                    value: attr.value
                })),
                largestDiscountPercentage: product.largestDiscountPercentage || 0,
                cartUUID: item.orderItemGuid,
                imageUrl: product.imageUrl || ''
            }
        })
        setProducts(data)
    }, [orderItemsResponse])

    const handleQuantityChange = async (id: number, value: number) => {
        try {
            await OrderService.updateOrderItem(id, value)
                .then(() => {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Số lượng cập nhật thành công!',
                        life: 3000
                    })
                    fetchProducts()
                })
                .catch((error) => {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: error.message,
                        life: 3000
                    })
                })
        } catch (error) {
            console.error('Không thể cập nhật sản phẩm trong đơn hàng:', error)
        }
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }
    return (
        <div>
            <h4>Danh sách sản phẩm đơn hàng</h4>

            <Toast ref={toast} />
            {products.map((product) => (
                <div
                    key={product.id}
                    className='p-4 rounded-lg flex items-start gap-4 border border-gray-300 shadow-md my-5'
                >
                    <div className='relative'>
                        <Image
                            src={product.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                            alt={product.name}
                            className='object-cover rounded-lg'
                            width={50}
                            height={50}
                        />
                        {product.largestDiscountPercentage > 0 && (
                            <div className='absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center'>
                                -{product.largestDiscountPercentage}%
                            </div>
                        )}
                    </div>
                    <div className='flex-1'>
                        <div className='flex justify-between items-center'>
                            <div className='font-semibold text-lg flex-grow flex-shrink-0 w-2/5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap'>
                                {product.name}
                            </div>
                            <div className='flex items-center space-x-2 bg-gray-200 p-2 rounded-lg h-8'>
                                <InputNumber
                                    disabled={true}
                                    min={1}
                                    id='number-input'
                                    value={
                                        orderItemsResponse.find((item) => item.orderItemGuid === product.cartUUID)
                                            ?.quantity || 1
                                    }
                                    onValueChange={(e) => {
                                        const newQuantity = e.value || 1
                                        const itemId =
                                            orderItemsResponse.find((item) => item.orderItemGuid === product.cartUUID)
                                                ?.id || 0
                                        handleQuantityChange(itemId, newQuantity)
                                    }}
                                    inputStyle={{
                                        width: '55px',
                                        textAlign: 'center',
                                        backgroundColor: 'transparent',
                                        border: 'none'
                                    }}
                                    className='w-10 h-8'
                                />
                            </div>
                            <div className='text-gray-600 text-sm flex-shrink-0 w-1/4'>
                                {product.discountPrice ? (
                                    <div>
                                        <span className='ml-2  font-semibold'>
                                            {product.discountPrice && product.quantity
                                                ? formatCurrency(Number(product.discountPrice) * product.quantity)
                                                : '0.00'}
                                        </span>
                                    </div>
                                ) : (
                                    <span>
                                        {product.unitPrice && product.quantity
                                            ? formatCurrency(Number(product.unitPrice) * product.quantity)
                                            : '0.00'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            {product.attributes &&
                                product.attributes.map((attr: ProductAttribute) => (
                                    <div key={attr.id} className='text-gray-600 mr-2 text-sm font-bold'>
                                        {attr?.name?.toUpperCase()}:{' '}
                                        <span className='font-medium'>{attr?.value?.toUpperCase()}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ))}
            <ProductDialog
                products={productsDialog}
                visible={visible}
                setVisible={setVisible}
                filters={filters}
                setFilters={setFilters}
                addProductToCart={(product: ProductResponse) => {
                    console.log(product)
                }}
                globalFilterValue={globalFilterValue}
                onGlobalFilterChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGlobalFilterValue(e.target.value)
                }}
            />
        </div>
    )
}
