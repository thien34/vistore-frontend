'use client'
import { useEffect, useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from 'primereact/button'
import { useLocalStorage } from 'primereact/hooks'
import OrderService from '@/service/order.service'
import CartService from '@/service/cart.service'
type Props = {
    totalAmount: number
}
const CheckoutPage = ({ totalAmount }: Props) => {
    const stripe = useStripe()
    const elements = useElements()
    const [errorMessage, setErrorMessage] = useState<string>()
    const [clientSecret, setClientSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const [orderLocal] = useLocalStorage('orderLocal', '')

    useEffect(() => {
        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 1000 })
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
    }, [totalAmount])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)

        if (!stripe || !elements) {
            return
        }

        const { error: submitError } = await elements.submit()

        if (submitError) {
            setErrorMessage(submitError.message)
            setLoading(false)
            return
        }
        const orderLocalParsed = JSON.parse(orderLocal)
        OrderService.createOrder(orderLocalParsed).then((res) => {
            if (res.status === 200) {
                localStorage.removeItem('orderLocal')
                CartService.deleteBill(orderLocalParsed.orderGuid)
            }
        })

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `http://www.localhost:3000/admin/payment-success`
            }
        })

        if (error) {
            // This point is only reached if there's an immediate error when
            // confirming the payment. Show the error to your customer (for example, payment details incomplete)
            setErrorMessage(error.message)
        } else {
            // The payment UI automatically closes with a success animation.
            // Your customer is redirected to your `return_url`.
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='bg-white p-2 rounded-md'>
            <PaymentElement />

            {errorMessage && <div>{errorMessage}</div>}

            <Button className='w-full mt-4 text-center font-bold flex justify-center' disabled={!stripe || loading}>
                {!loading ? `Thanh toán` : 'Đang xử lý...'}
            </Button>
        </form>
    )
}

export default CheckoutPage
