import { Button } from 'primereact/button'
import RequiredIcon from '@/components/icon/RequiredIcon'
import { ProductAttribute } from '@/interface/Product'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'

type Props = {
    visible: boolean
    setVisible: (visible: boolean) => void
    productAttribute: ProductAttribute
    setProductAttribute: (productAttribute: ProductAttribute) => void
    submitted: boolean
    setSubmitted: (submitted: boolean) => void
    hideDialog: () => void
    saveProductAttribute: () => void
}

export default function AtbDialog({
    visible,
    setVisible,
    productAttribute,
    setProductAttribute,
    submitted,
    hideDialog,
    saveProductAttribute
}: Props) {
    const productAttributeDialogFooter = (
        <>
            <Button label='Hủy' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Lưu' icon='pi pi-check' onClick={saveProductAttribute} />
        </>
    )

    return (
        <>
            <Dialog
                visible={visible}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Thêm thuộc tính'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={productAttributeDialogFooter}
                onHide={() => setVisible(false)}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Tên thuộc tính <RequiredIcon />
                    </label>
                    <InputText
                        id='name'
                        value={productAttribute.name}
                        onChange={(e) => setProductAttribute({ ...productAttribute, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !productAttribute.name })}
                    />
                    {submitted && !productAttribute.name && (
                        <small className='p-error'>Tên thuộc tính là bắt buộc.</small>
                    )}
                </div>
                <div className='field'>
                    <label htmlFor='description' className='font-bold'>
                        Mô tả
                    </label>
                    <InputText
                        id='description'
                        value={productAttribute.description}
                        onChange={(e) => setProductAttribute({ ...productAttribute, description: e.target.value })}
                    />
                </div>
            </Dialog>
        </>
    )
}
