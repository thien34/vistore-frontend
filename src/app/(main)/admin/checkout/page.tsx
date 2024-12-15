'use client'
import Checkout from './_components/Checkout'

import { loadStripe } from '@stripe/stripe-js'
import { useRef, useState } from 'react'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { Elements } from '@stripe/react-stripe-js'
import CartService from '@/service/cart.service'
import { CartResponse } from '@/interface/cart.interface'
import CartItem from '../retail/_components/CartItem'
import { Toast } from 'primereact/toast'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

export default function CheckoutPage() {
    const [amountPaidLocal, setAmountPaidLocal] = useLocalStorage<number>(1000, 'amountPaid')
    const [billId, setBillId] = useState<string | null>(null)

    const [carts, setCarts] = useState<CartResponse[]>([])
    const toast = useRef<Toast>(null)
    const router = useRouter()

    useMountEffect(() => {
        let storedBillId = null
        if (typeof window !== 'undefined') {
            storedBillId = localStorage.getItem('billIdCurrent')
            setBillId(storedBillId)
        }
        if (!storedBillId) {
            router.push('/admin/retail')
        }
    })

    useUpdateEffect(() => {
        fetchCart()
    }, [billId])

    const fetchCart = () => {
        if (!billId) return
        CartService.getCart(billId).then((res) => {
            const sortedCarts = res.sort((a, b) => a.cartUUID.localeCompare(b.cartUUID))
            setCarts(sortedCarts)
        })
    }

    function handleCartItemDelete(cart: CartResponse, event: React.MouseEvent<HTMLElement>): void {
        confirmPopup({
            target: event.currentTarget,
            message: 'Bạn có chắc là bạn muốn xóa sản phẩm này khỏi giỏ hàng?',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                CartService.deleteBill(cart.cartUUID)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Xóa sản phẩm khỏi giỏ hàng thành công',
                            life: 1000
                        })
                        fetchCart()
                    })
                    .catch((error) => {
                        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error)
                    })
            }
        })
    }

    return (
        <main className='card  '>
            <div className=''>
                <h5>
                    Tổng số tiền: <span className='font-bold text-primary-700'>${amountPaidLocal}</span>
                </h5>
                <h5>
                    Mã đặt hàng: <span className='font-bold text-primary-700'>{billId}</span>
                </h5>
            </div>
            <ConfirmPopup />
            {carts.length > 0 && (
                <>
                    <div className='space-y-4 card mt-2'>
                        {carts.map((cart) => (
                            <CartItem
                                key={cart.id}
                                cart={cart}
                                onQuantityChange={fetchCart}
                                onDelete={() => handleCartItemDelete(cart, {} as React.MouseEvent<HTMLElement>)}
                            />
                        ))}
                    </div>
                </>
            )}

            <Elements
                stripe={stripePromise}
                options={{
                    mode: 'payment',
                    amount: amountPaidLocal * 100,
                    currency: 'usd'
                }}
            >
                <Checkout totalAmount={amountPaidLocal} />
            </Elements>
        </main>
    )
}
