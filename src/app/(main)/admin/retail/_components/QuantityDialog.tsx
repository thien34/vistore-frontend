import React from 'react'
import { InputNumber } from 'primereact/inputnumber'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { ProductResponseDetails } from '@/interface/Product'

interface QuantityDialogProps {
    visible: boolean
    setVisible: (visible: boolean) => void
    product: ProductResponseDetails | null
    quantity: number
    setQuantity: (quantity: number) => void
    onSave: () => void
}

const QuantityDialog = ({ visible, setVisible, product, quantity, setQuantity, onSave }: QuantityDialogProps) => {
    return (
        <Dialog
            header={product?.name}
            visible={visible}
            style={{ width: '50vw' }}
            onHide={() => {
                setVisible(false)
                setQuantity(1)
            }}
        >
            <div>
                <span className='text-lg font-semibold text-gray-600'>Số lượng có sẵn: {product?.quantity}</span>
                {product?.attributes.map((attribute) => (
                    <div key={attribute.id} className='flex items-center gap-2 p-2 mb-2 rounded-lg bg-gray-50'>
                        <span className='font-semibold text-gray-700 min-w-[50px]'>{attribute.name}:</span>
                        <span className='text-gray-600'>{attribute.value?.toUpperCase()}</span>
                    </div>
                ))}
                <div className='mt-2'>
                    <InputNumber
                        onValueChange={(e) => setQuantity(e.value ?? 1)}
                        value={quantity}
                        defaultValue={1}
                        min={quantity === 1 ? 1 : 0}
                        max={product?.quantity ?? 1}
                        showButtons
                        buttonLayout='horizontal'
                        decrementButtonClassName='p-button-secondary'
                        incrementButtonClassName='p-button-secondary'
                        incrementButtonIcon='pi pi-plus'
                        decrementButtonIcon='pi pi-minus'
                    />
                </div>
                <div className='flex justify-end mt-2'>
                    <Button label='Lưu' onClick={onSave} />
                </div>
            </div>
        </Dialog>
    )
}

export default QuantityDialog
