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
    const [showContainer, setShowContainer] = useState(false)

    const [payOSConfig, setPayOSConfig] = useState({
        RETURN_URL: window.location.origin,
        ELEMENT_ID: 'embedded-payment-container',
        CHECKOUT_URL: '',
        embedded: true,
        onSuccess: () => {
            setAmountPaid(paymentOSRequest.amount)
            setVisible(false)
            handleClose()
        }
    })

    const { open, exit } = usePayOS(payOSConfig)

    const handleClose = () => {
        exit()
        setIsOpen(false)
        setShowContainer(false)
        setPayOSConfig((prev) => ({
            ...prev,
            CHECKOUT_URL: ''
        }))
    }

    const createPaymentLink = async () => {
        setIsLoading(true)
        try {
            const checkoutUrl = await PayOSService.createPaymentLink(paymentOSRequest)
            setPayOSConfig((prev) => ({
                ...prev,
                CHECKOUT_URL: checkoutUrl
            }))
            setIsOpen(true)
            setShowContainer(true)
        } catch (error) {
            console.error('Lỗi:', error)
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
                    {!isOpen && (
                        <button onClick={createPaymentLink} disabled={isLoading} className='p-button p-component'>
                            {isLoading ? 'Đang tạo link...' : 'Tạo link thanh toán'}
                        </button>
                    )}
                    {showContainer && <div id='embedded-payment-container' style={{ height: '350px' }}></div>}
                    {isOpen && (
                        <button onClick={handleClose} className='p-button-secondary'>
                            Đóng link
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default PayOSForm
