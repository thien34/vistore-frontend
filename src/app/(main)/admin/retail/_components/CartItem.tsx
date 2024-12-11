import { useRef, useState } from 'react'
import { CartResponse } from '@/interface/cart.interface'
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { useUpdateEffect } from 'primereact/hooks'
import CartService from '@/service/cart.service'
import Image from 'next/image'
import { Toast } from 'primereact/toast'

interface CartItemProps {
    cart: CartResponse
    onDelete: (id: string) => void
    onQuantityChange: () => void
}

const CartItem = ({ cart, onDelete, onQuantityChange }: CartItemProps) => {
    const [quantity, setQuantity] = useState(cart.quantity)
    const toast = useRef<Toast>(null)

    useUpdateEffect(() => {
        setQuantity(cart.quantity)
    }, [cart.quantity])

    const handleIncrement = async () => {
        if (await updateCartQuantity(quantity + 1)) {
            setQuantity((prev) => prev + 1)
        }
    }

    const handleDecrement = async () => {
        if (quantity > 1) {
            if (await updateCartQuantity(quantity - 1)) {
                setQuantity((prev) => prev - 1)
            }
        }
    }

    const handleChange = (e: InputNumberValueChangeEvent) => {
        const value = e.value
        if (value && value >= 1) {
            setQuantity(value)
            updateCartQuantity(value)
        }
    }

    const updateCartQuantity = async (newQuantity: number): Promise<boolean> => {
        try {
            await CartService.updateCartQuantity(cart.id, newQuantity)
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Số lượng được cập nhật thành công',
                life: 3000
            })
            onQuantityChange()
            return true
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
                life: 3000
            })
            return false
        }
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    return (
        <>
            <div className='p-4 rounded-lg flex items-start gap-4 border border-gray-300 shadow-md my-5'>
                <Toast ref={toast} />
                <div className='relative'>
                    <Image
                        src={cart.productResponse.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                        alt={cart.productResponse.name}
                        className='object-cover rounded-lg'
                        width='50'
                        height='50'
                    />
                    {cart.productResponse.largestDiscountPercentage > 0 && (
                        <div className='absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center'>
                            -{cart.productResponse.largestDiscountPercentage}%
                        </div>
                    )}
                </div>
                <div className='flex-1'>
                    <div className='flex justify-between items-center'>
                        <div className='font-semibold text-lg flex-grow flex-shrink-0 w-2/5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap'>
                            {cart.productResponse.name}
                        </div>
                        <div className='flex items-center space-x-2 bg-gray-200 p-2 rounded-lg h-8'>
                            <button
                                onClick={handleDecrement}
                                className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition'
                            >
                                -
                            </button>
                            <InputNumber
                                min={1}
                                id='number-input'
                                value={quantity}
                                onValueChange={handleChange}
                                inputStyle={{
                                    width: '55px',
                                    textAlign: 'center',
                                    backgroundColor: 'transparent',
                                    border: 'none'
                                }}
                                className='w-10 h-8 '
                            />
                            <button
                                onClick={handleIncrement}
                                className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition'
                            >
                                +
                            </button>
                        </div>
                        <div className='text-gray-600 text-sm flex-shrink-0 w-1/4'>
                            {cart.productResponse.discountPrice ? (
                                <div>
                                    <span className='line-through text-gray-400'>
                                        {formatCurrency(cart.productResponse.price * quantity)}
                                    </span>
                                    <span className='ml-2 text-red-500 font-semibold'>
                                        {formatCurrency(cart.productResponse.discountPrice * quantity)}
                                    </span>
                                </div>
                            ) : (
                                <span>{formatCurrency(cart.productResponse.price * quantity)}</span>
                            )}
                        </div>
                        <RiDeleteBin6Line
                            onClick={() => onDelete(cart.cartUUID)}
                            className='text-white bg-red-500 cursor-pointer text-5xl p-2 rounded-lg transition-colors flex-shrink-0'
                        />
                    </div>
                    <div>
                        {cart.productResponse.attributes?.map((attr) => (
                            <div key={attr.id} className='text-gray-600 mr-2 text-sm font-bold'>
                                {attr.name.toUpperCase()}:{' '}
                                <span className='font-medium'>{attr.value?.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CartItem
