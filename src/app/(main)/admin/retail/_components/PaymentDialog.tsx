import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { Toast } from 'primereact/toast'
import { ToggleButton } from 'primereact/togglebutton'
import { useMemo, useRef, useState } from 'react'
import PayOSForm from './PayOSEmbeddedForm'

type PaymentDialogProps = {
    visible: boolean
    setVisible: (visible: boolean) => void
    totalAmount: number
    setAmountPaid: (amount: number) => void
    amountPaid: number
}

export default function PaymentDialog({ visible, setVisible, totalAmount, setAmountPaid }: PaymentDialogProps) {
    const [checked, setChecked] = useState(true)
    const toast = useRef<Toast>(null)
    const [amountPaidState, setAmountPaidState] = useState(0)

    const onHide = () => {
        setVisible(false)
        setAmountPaidState(0)
    }

    const onSave = () => {
        if (amountPaidState < totalAmount) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Số tiền thanh toán không được nhỏ hơn tổng số tiền',
                life: 3000
            })
            return
        }
        setAmountPaid(totalAmount)
        setTimeout(() => {
            onHide()
        }, 500)
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    const amountRemaining = useMemo(() => Math.max(0, totalAmount - amountPaidState), [totalAmount, amountPaidState])
    const amountExcess = useMemo(() => Math.max(0, amountPaidState - totalAmount), [totalAmount, amountPaidState])

    return (
        <Dialog
            header='Thanh toán'
            style={{ width: '40vw', marginLeft: '15vw' }}
            visible={visible}
            modal
            draggable={false}
            onHide={onHide}
        >
            <Toast ref={toast} />
            <div className='flex flex-col gap-4 px-4'>
                <div className='flex justify-between items-center gap-2'>
                    <div className='text-xl font-medium text-gray-900 dark:text-white'>Tổng số tiền</div>
                    <div className='text-xl font-medium text-primary-700 dark:text-white'>
                        {formatCurrency(totalAmount)}
                    </div>
                </div>
                <div className='flex justify-center items-center gap-2'>
                    <ToggleButton
                        checked={checked == true}
                        onChange={(e) => setChecked(e.value)}
                        className='text-xl font-medium text-black '
                        onLabel='Tiền mặt'
                        offLabel='Tiền mặt'
                        style={{ width: '100%' }}
                    />
                    <ToggleButton
                        checked={checked == false}
                        onChange={(e) => setChecked(!e.value)}
                        className='text-xl font-medium text-black'
                        onLabel='Chuyển khoản'
                        offLabel='Chuyển khoản'
                        style={{ width: '100%' }}
                    />
                </div>
                {checked ? (
                    <>
                        <div className='flex flex-col gap-1'>
                            <label className='text-xl ms-0 font-medium text-gray-900 dark:text-white'>
                                Số tiền khách hàng đã thanh toán
                            </label>
                            <InputNumber
                                placeholder='Nhập số tiền'
                                className='w-full'
                                value={amountPaidState}
                                min={0}
                                showButtons
                                onChange={(e) => setAmountPaidState(e.value ?? 0)}
                            />
                        </div>
                        <div className='flex justify-between items-center gap-2'>
                            <label className='text-xl ms-0 font-medium text-gray-900 dark:text-white'>
                                Tiền phải trả
                            </label>
                            <div className='text-xl font-medium text-primary-700 dark:text-white'>
                                {formatCurrency(amountRemaining)}
                            </div>
                        </div>
                        <div className='flex justify-between items-center gap-2'>
                            <label className='text-xl ms-0 font-medium text-gray-900 dark:text-white'>Tiền thừa</label>
                            <div className='text-xl font-medium text-green-700 dark:text-white'>
                                {formatCurrency(amountExcess)}
                            </div>
                        </div>
                        <div className='flex justify-end items-center gap-2'>
                            <Button label='Lưu' icon='pi pi-save' onClick={onSave} />
                        </div>
                    </>
                ) : (
                    <>
                        <PayOSForm
                            paymentOSRequest={{
                                items: [],
                                amount: Number(totalAmount.toFixed(0)),
                                description: 'thanh toan hang'
                            }}
                            setVisible={setVisible}
                            setAmountPaid={setAmountPaid}
                        />
                    </>
                )}
            </div>
        </Dialog>
    )
}
