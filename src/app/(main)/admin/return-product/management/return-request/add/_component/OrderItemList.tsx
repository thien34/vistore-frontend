'use client'

import { OrderItemsResponse } from "@/interface/orderItem.interface"
import { ReturnItemRequest } from "@/interface/returnProduct.interface"
import Image from "next/image"
import { InputNumber } from "primereact/inputnumber"
import { useCallback, useEffect, useState } from "react"
import { RiDeleteBin6Line } from "react-icons/ri"

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
    idOderItem: number
}
interface Props {
    initialOrderItems: OrderItemsResponse[]
    setReturnItems: (returnItems: ReturnItemRequest[]) => void
    isEditable: boolean
    ReturnItems: ReturnItemRequest[]
}

const OrderItemList = ({ initialOrderItems, ReturnItems, setReturnItems, isEditable }: Props) => {
    const [orderItemsResponse, setOrderItemsResponse] = useState<OrderItemsResponse[]>(initialOrderItems)
    const [products, setProducts] = useState<Product[]>([])
    const [returnItems, setReturnItemsRequest] = useState<ReturnItemRequest[]>(ReturnItems)
    const fetchItem = useCallback(() => {
        const data: Product[] = orderItemsResponse.map((item) => {
            const product = JSON.parse(item.productJson)
            return {
                id: product.id,
                name: product.name,
                unitPrice: product.unitPrice,
                discountPrice: product.discountPrice,
                quantity: item.quantity,
                attributes:
                    product.productAttributeValues?.map((attr: ProductAttribute) => ({
                        id: attr.id,
                        name: attr.productAttribute.name,
                        value: attr.value
                    })) || [],
                largestDiscountPercentage: product.largestDiscountPercentage || 0,
                cartUUID: item.orderItemGuid,
                imageUrl: product.image || '',
                idOderItem: item.id
            }
        })
        setProducts(data)
    }, [orderItemsResponse])
    const productQuantity = useCallback(() => {
        const data: ReturnItemRequest[] = orderItemsResponse.map((item) => {
            const product = JSON.parse(item.productJson)
            return {
                returnRequestId: undefined,
                orderItemId: item.id,
                productId: product.id,
                quantity: item.quantity,
                oldUnitPrice: product.unitPrice,
                discountAmountPerItem: item.discountAmount / item.quantity,
                refundTotal: item.quantity * product.unitPrice - item.discountAmount
            }
        })
        setReturnItems(data)
        setReturnItemsRequest(data)
    }, [orderItemsResponse])

    useEffect(() => {
        setOrderItemsResponse(initialOrderItems)
    }, [initialOrderItems]);

    useEffect(() => {
        if (orderItemsResponse.length > 0) {
            fetchItem();
            console.log("Product", products)
            productQuantity();
            console.log("Product Quantity", productQuantity)
        }
    }, [orderItemsResponse]);


    const getCurrentQuantity = (itemId: number) => {
        return returnItems.find(item => item.orderItemId === itemId)?.quantity
    }

    const getCurrentReturnItem = (itemId: number) => {
        return returnItems.find(item => item.orderItemId === itemId)
    }

    const updateReturnItemQuantity = (quantity: number, itemId: number) => {
        const index = returnItems.findIndex(item => item.orderItemId === itemId)
        const newReturnItems = [...returnItems]
        const maxQuantity = products.find(product => product.idOderItem === itemId)?.quantity
        if (maxQuantity !== undefined && quantity > maxQuantity) {
            quantity = maxQuantity
            newReturnItems[index].quantity = quantity
            newReturnItems[index].refundTotal = quantity * (newReturnItems[index].oldUnitPrice - newReturnItems[index].discountAmountPerItem)
            setReturnItems(newReturnItems)
            setReturnItemsRequest(newReturnItems)
        }
    }
    const handleIncreaseQuantity = (itemId: number) => {
        const index = returnItems.findIndex(item => item.orderItemId === itemId)
        const newReturnItems = [...returnItems]
        const maxQuantity = products.find(product => product.idOderItem === itemId)?.quantity
        if (maxQuantity !== undefined && newReturnItems[index].quantity < maxQuantity) {
            newReturnItems[index].quantity += 1
            newReturnItems[index].refundTotal = newReturnItems[index].quantity * (newReturnItems[index].oldUnitPrice - newReturnItems[index].discountAmountPerItem)
            setReturnItems(newReturnItems)
            setReturnItemsRequest(newReturnItems)
        }
    }
    const handleDecreaseQuantity = (itemId: number) => {
        const index = returnItems.findIndex(item => item.orderItemId === itemId)
        const newReturnItems = [...returnItems]
        if (newReturnItems[index].quantity > 1) {
            newReturnItems[index].quantity -= 1
            newReturnItems[index].refundTotal = newReturnItems[index].quantity * (newReturnItems[index].oldUnitPrice - newReturnItems[index].discountAmountPerItem)
            setReturnItems(newReturnItems)
            setReturnItemsRequest(newReturnItems)
        }
    }
    const deleteProduct = (itemId: number) => {
        setReturnItems(returnItems.filter(item => item.orderItemId !== itemId));
        setReturnItemsRequest(returnItems.filter(item => item.orderItemId !== itemId))
    }


    return (
        <>
            {products.map((product) => (
                <div
                    key={product.id}
                    className='p-1 rounded-lg flex items-start gap-2 border border-gray-300 shadow-md my-1'
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
                            <div className='flex items-center space-x-2 bg-gray-200 p-2 rounded-lg h-12'>
                                <button
                                    onClick={() => handleDecreaseQuantity(product.idOderItem)}
                                    className='p-1 w-10 h-10 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50'
                                    disabled={!isEditable}
                                >
                                    -
                                </button>
                                <div className="flex items-center">
                                    <InputNumber
                                        min={1}
                                        id='number-input'
                                        value={getCurrentQuantity(product.idOderItem) || 0}
                                        onValueChange={(e) => {
                                            const newQuantity = e.value || 1
                                            const itemId =
                                                orderItemsResponse.find(
                                                    (item) => item.orderItemGuid === product.cartUUID
                                                )?.id || 0
                                            updateReturnItemQuantity(newQuantity, itemId)
                                        }}
                                        inputStyle={{
                                            width: '55px',
                                            textAlign: 'center',
                                            backgroundColor: 'transparent',
                                            border: 'none'
                                        }}
                                        className='w-10 h-10'
                                        disabled={!isEditable}
                                    />
                                    <span className="ml-2 text-lg text-gray-600">/{product.quantity}</span>
                                </div>
                                <button
                                    onClick={() => handleIncreaseQuantity(product.idOderItem)}
                                    className='p-1 w-10 h-10 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50'
                                    disabled={!isEditable}
                                >
                                    +
                                </button>
                            </div>
                            <div className='text-gray-600 text-sm flex-shrink-0 w-1/4'>
                                {(getCurrentReturnItem(product.idOderItem)?.discountAmountPerItem ?? 0) > 0 ? (
                                    <div>
                                        <span className='line-through text-gray-400'>
                                            $
                                            {getCurrentReturnItem(product.idOderItem) ? Number(getCurrentReturnItem(product.idOderItem)!.oldUnitPrice * getCurrentReturnItem(product.idOderItem)!.quantity).toFixed(2) : '0.00'}
                                        </span>
                                        <span className='ml-2 text-red-500 font-semibold'>
                                            $
                                            {getCurrentReturnItem(product.idOderItem) ? Number(getCurrentReturnItem(product.idOderItem)!.refundTotal.toFixed(2)) : '0.00'}
                                        </span>
                                    </div>
                                ) : (
                                    <span>
                                        $
                                        {getCurrentReturnItem(product.idOderItem) ? Number(getCurrentReturnItem(product.idOderItem)!.oldUnitPrice * getCurrentReturnItem(product.idOderItem)!.quantity).toFixed(2) : '0.00'}
                                    </span>
                                )}
                            </div>
                            <button
                                disabled={!isEditable}
                                onClick={() => deleteProduct(product.idOderItem)}
                                className='text-white bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors flex-shrink-0'
                            >
                                <RiDeleteBin6Line className='cursor-pointer text-4xl p-2 rounded-lg transition-colors flex-shrink-0' />
                            </button>
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
        </>
    )
}

export default OrderItemList;