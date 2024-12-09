import { useState, useEffect } from 'react'
import { usePayOS } from '@payos/payos-checkout'
import { PaymentOSRequest } from '@/interface/payment.interface'
import { PayOSService } from '@/service/payment.service'

interface PayOSFormProps {
    paymentOSRequest: PaymentOSRequest
    setVisible: (visible: boolean) => void
    setAmountPaid: (amount: number) => void
}

const PayOSForm = ({ paymentOSRequest, setVisible, setAmountPaid }: PayOSFormProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const [payOSConfig, setPayOSConfig] = useState({
        RETURN_URL: window.location.origin,
        ELEMENT_ID: 'embedded-payment-container',
        CHECKOUT_URL: '',
        embedded: true,
        onSuccess: () => {
            setAmountPaid(paymentOSRequest.amount)
            setVisible(false)
            setIsOpen(false)
        }
    })

    const { open, exit } = usePayOS(payOSConfig)

    const createPaymentLink = async () => {
        setIsLoading(true)
        try {
            const checkoutUrl = await PayOSService.createPaymentLink(paymentOSRequest)
            setPayOSConfig((prev) => ({
                ...prev,
                CHECKOUT_URL: checkoutUrl
            }))
            setIsOpen(true)
        } catch (error) {
            console.error('Error:', error)
            setMessage('Không thể tạo link thanh toán.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL) {
            open()
        }
    }, [open, payOSConfig.CHECKOUT_URL])

    return (
        <div>
            {message ? (
                <div>
                    <p>{message}</p>
                </div>
            ) : (
                <div>
                    <button onClick={createPaymentLink} disabled={isLoading} className='p-button p-component'>
                        {isLoading ? 'Đang tạo link...' : 'Tạo link thanh toán'}
                    </button>
                    {isOpen && <div id='embedded-payment-container' style={{ height: '350px' }}></div>}
                    {isOpen && (
                        <button onClick={() => exit()} className='p-button-secondary'>
                            Đóng link
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default PayOSForm