'use client'
import { ProductResponseDetails } from '@/interface/Product'
import { ProductAttribute, ProductAttributeName } from '@/interface/productAttribute.interface'
import AttributeValueService from '@/service/AttributeValueService'
import PictureService from '@/service/PictureService'
import ProductService from '@/service/ProducrService'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { PrimeIcons } from 'primereact/api'
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Tooltip } from 'primereact/tooltip'
import { useEffect, useRef, useState } from 'react'
import { Promotion } from '@/interface/discount.interface'
import { Message } from 'primereact/message'
import QRCode from 'react-qr-code'
import Image from 'next/image'
import RequiredIcon from '@/components/icon/RequiredIcon'
import productAttributeService from '@/service/productAttribute.service'
import { useMountEffect } from 'primereact/hooks'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import AtbDialog from '../../add/_components/AtbDialog'
import Link from 'next/link'

type AttributeRow = {
    selectedAttribute: ProductAttributeName | null
    selectedValues: string | undefined
}

type Props = {
    product: ProductResponseDetails
}
const emptyProductAttribute: ProductAttribute = {
    name: '',
    description: ''
}
const ProductDetailsForm: React.FC<Props> = ({ product }) => {
    const [formData, setFormData] = useState<ProductResponseDetails>(product)
    const [imageUrl, setImageUrl] = useState<string>(product.imageUrl)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [discount, setDiscount] = useState(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useRef<Toast>(null)
    const [productAttributes, setProductAttributes] = useState<ProductAttributeName[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [productAttribute, setProductAttribute] = useState<ProductAttribute>(emptyProductAttribute)
    const [atbDialogVisible, setAtbDialogVisible] = useState(false)
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>(
        product.attributes.map((attr) => ({
            selectedAttribute: { id: attr.id, name: attr.name },
            selectedValues: attr.value
        }))
    )
    const [errors, setErrors] = useState({
        sku: '',
        name: '',
        price: '',
        quantity: '',
        productCost: '',
        attributes: ''
    })
    useMountEffect(() => {
        fetchAttributes()
    })
    const fetchAttributes = async () => {
        const response = await productAttributeService.getListName()
        setProductAttributes(response.payload)
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof ProductResponseDetails
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
    }
    const validateFields = () => {
        const newErrors = { sku: '', name: '', price: '', quantity: '', productCost: '', attributes: '' }
        let isValid = true

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU là bắt buộc'
            isValid = false
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm là bắt buộc'
            isValid = false
        }
        if (!formData.price || isNaN(Number(formData.price)) || formData.price <= 10000) {
            newErrors.price = 'Giá phải lớn hơn 10,000'
            isValid = false
        }
        if (!formData.quantity || isNaN(Number(formData.quantity)) || formData.quantity < 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0'
            isValid = false
        }
        if (!formData.productCost || isNaN(Number(formData.productCost)) || formData.productCost <= 10000) {
            newErrors.productCost = 'Giá nhập phải lớn hơn 10,000'
            isValid = false
        }

        const missingAttributes = attributeRows.filter((row) => {
            return row.selectedAttribute && !row.selectedValues
        })
        if (missingAttributes.length > 0) {
            newErrors.attributes = 'Vui lòng chọn tất cả các thuộc tính cho mỗi kết hợp'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSave = async () => {
        const isValid = validateFields()
        if (Object.keys(isValid).length > 0) {
            return
        }

        if (!isValid) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Vui lòng điền vào tất cả các trường bắt buộc',
                life: 3000
            })
            return
        }
        const filteredAttributes = attributeRows
            .filter((attr) => attr.selectedAttribute !== null)
            .map((attr) => ({
                attributeId: attr.selectedAttribute!.id,
                productId: formData.id,
                value: attr.selectedValues
            }))

        if (filteredAttributes.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Vui lòng chọn ít nhất một thuộc tính',
                life: 3000
            })
            return
        }

        const productData = {
            id: formData.id,
            name: formData.name,
            deleted: formData.deleted,
            categoryId: formData.categoryId,
            manufacturerId: formData.manufacturerId,
            sku: formData.sku,
            unitPrice: formData.price,
            quantity: formData.quantity,
            productCost: formData.productCost,
            attributes: filteredAttributes,
            gtin: formData.gtin,
            imageUrl: product.imageUrl
        }

        if (uploadedFile) {
            const imageRes = await PictureService.savePicture(uploadedFile)
            productData.imageUrl = imageRes
        }

        try {
            await ProductService.updateProduct(formData.id, productData)
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Sản phẩm đã được cập nhật thành công',
                life: 3000
            })
        } catch (error) {
            console.error('Không cập nhật được sản phẩm:', error)
        }
    }

    const addAttributeRow = () => {
        if (attributeRows.length >= 5) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Số lượng thuộc tính không được vượt quá 5',
                life: 3000
            })
            return
        }
        setAttributeRows([...attributeRows, { selectedAttribute: null, selectedValues: '' }])
    }

    const removeAttributeRow = (index: number) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn xóa thuộc tính này không?',
            header: 'Xác nhận xóa thuộc tính',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => {
                setAttributeRows((prevRows) => prevRows.filter((_, i) => i !== index))
            }
        })
    }
    useEffect(() => {
        const fetchDiscounts = async (productId: number) => {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/discounts/by-product/${productId}`)
                const data = await response.json()

                const activeDiscounts = data.data.filter((discount: Promotion) => discount.status === 'ACTIVE')
                if (activeDiscounts.length > 0) {
                    const sortedDiscounts = activeDiscounts.sort(
                        (a: Promotion, b: Promotion) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0)
                    )
                    setDiscount(sortedDiscounts[0]) // Set the highest discount
                }
            } catch (error) {
                console.error('Lỗi khi lấy chiết khấu: ', error)
            }
        }

        if (product.id) {
            fetchDiscounts(product.id)
        }
    }, [product])

    const fetchValues = async (attribuetId: number) => {
        try {
            const { payload } = await AttributeValueService.getAttributeValues(product.id, attribuetId)

            if (!Array.isArray(payload)) return []

            const uniqueNames = Array.from(new Set(payload.map((value) => value.name)))

            return uniqueNames
        } catch (error) {
            console.error('Lỗi khi lấy giá trị thuộc tính:', error)
            return []
        }
    }

    const getAvailableAttributes = () => {
        const selectedAttributeCodes = new Set(attributeRows.map((row) => row.selectedAttribute?.id).filter(Boolean))
        return productAttributes.filter((attr) => !selectedAttributeCodes.has(attr.id))
    }
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF hoặc WebP',
                    life: 3000
                })
                return
            }

            const maxSize = 5 * 1024 * 1024
            if (file.size > maxSize) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Kích thước file không được vượt quá 5MB',
                    life: 3000
                })
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setImageUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            setUploadedFile(file)
        }
    }

    const [items, setItems] = useState<string[]>([])

    const search = async (event: AutoCompleteCompleteEvent, attribuetId: number) => {
        const fetchedValues = await fetchValues(attribuetId)
        setItems(fetchedValues.filter((item) => item.toLowerCase().includes(event.query.toLowerCase())))
    }

    const saveProductAttribute = async () => {
        setSubmitted(true)
        if (productAttribute.name.trim()) {
            if (!productAttribute.id) {
                await productAttributeService
                    .create(productAttribute)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Thuộc tính sản phẩm đã được thêm thành công',
                            life: 3000
                        })
                        hideDialog()
                    })
                    .catch((error) => {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message,
                            life: 3000
                        })
                    })
            }
        }
    }
    const hideDialog = () => {
        setSubmitted(false)
        setProductAttribute(emptyProductAttribute)
        setAtbDialogVisible(false)
        fetchAttributes()
    }
    const isAddAttributeDisabled = () => {
        const availableAttributes = getAvailableAttributes()
        return availableAttributes.length === 0
    }
    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='flex justify-between items-center gap-2'>
                <h4>Cập Nhật Chi Tiết Sản Phẩm</h4>
                <Link href={`/admin/products/${product.id}`}>
                    <Image src={'/layout/images/btn-back.png'} alt='ViStore' width='20' height='20' />
                </Link>
            </div>

            <div className='flex flex-column gap-4'>
                {discount && (
                    <div className='mb-3'>
                        <Message
                            style={{
                                border: 'solid #f39c12',
                                borderWidth: '0 0 0 6px',
                                color: '#f39c12'
                            }}
                            className='border-warning w-full justify-content-start'
                            severity='warn'
                            content={
                                <div className='flex align-items-center'>
                                    <i
                                        className='pi pi-exclamation-triangle'
                                        style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}
                                    ></i>
                                    <div>
                                        Cảnh báo: Sản phẩm này hiện đang được giảm giá và không thể chỉnh sửa giá cho
                                        đến khi giảm giá kết thúc.
                                    </div>
                                </div>
                            }
                        />
                    </div>
                )}
                <div className='p-grid p-fluid'>
                    <div className='flex flex-row gap-4'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='sku'>
                                SKU <RequiredIcon />
                            </label>
                            <InputText
                                tooltip='Nhập SKU cho sản phẩm'
                                id='sku'
                                tooltipOptions={{ position: 'bottom' }}
                                className={errors.sku ? 'p-invalid' : ''}
                                value={formData.sku}
                                onChange={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setErrors({ ...errors, sku: 'SKU là bắt buộc' })
                                    } else {
                                        setErrors({ ...errors, sku: '' })
                                    }
                                    handleChange(e, 'sku')
                                }}
                            />
                            {errors.sku && <small className='p-error'>{errors.sku}</small>}
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='name'>Tên Sản Phẩm</label>
                            <InputText
                                id='name'
                                tooltipOptions={{ position: 'bottom' }}
                                disabled
                                value={formData.name}
                                onChange={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setErrors({ ...errors, name: 'Tên sản phẩm là bắt buộc' })
                                    } else {
                                        setErrors({ ...errors, name: '' })
                                    }
                                    handleChange(e, 'name')
                                }}
                                className={errors.name ? 'p-invalid' : ''}
                            />
                            {errors.name && <small className='p-error'>{errors.name}</small>}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='price'>
                                Giá <RequiredIcon />
                            </label>
                            <InputNumber
                                tooltip='Nhập giá sản phẩm'
                                inputId='price'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.price}
                                onValueChange={(e) => {
                                    if (!e.value || e.value < 100000 || e.value > 100000000) {
                                        setErrors({ ...errors, price: 'Giá phải từ 100,000 đến 100,000,000' })
                                    } else {
                                        setErrors({ ...errors, price: '' })
                                    }
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'price' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                disabled={!!discount}
                                className={discount ? 'p-disabled' : ''}
                                currency='VND'
                                locale='vi-VN'
                                minFractionDigits={0}
                                max={100000000}
                            />
                            {errors.price && <small className='p-error'>{errors.price}</small>}
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='productCost' className='mb-2'>
                                Giá Nhập <RequiredIcon />
                            </label>
                            <InputNumber
                                tooltip='Nhập giá nhập cho sản phẩm'
                                itemID='productCost'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.productCost}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 100000) {
                                        setErrors({ ...errors, productCost: 'Giá nhập phải lớn hơn 100,000' })
                                    } else {
                                        setErrors({ ...errors, productCost: '' })
                                    }
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'productCost' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                className={errors.productCost ? 'p-invalid' : ''}
                                currency='VND'
                                locale='vi-VN'
                                minFractionDigits={0}
                                max={100000000}
                            />
                            {errors.productCost && <small className='p-error'>{errors.productCost}</small>}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='quantity'>
                                Số Lượng <RequiredIcon />
                            </label>
                            <InputNumber
                                tooltip='Nhập số lượng cho sản phẩm'
                                inputId='quantity'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.quantity}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, quantity: 'Số lượng phải lớn hơn 0' })
                                    } else {
                                        setErrors({ ...errors, quantity: '' })
                                    }
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'quantity' as keyof ProductResponseDetails
                                    )
                                }}
                                className={errors.quantity ? 'p-invalid' : ''}
                                max={1000000}
                            />
                            {errors.quantity && <small className='p-error'>{errors.quantity}</small>}
                        </div>
                        <div className='grid grid-cols-1 p-2 items-center gap-6 w-full'>
                            <Tooltip target='.image' />

                            <Image
                                width={100}
                                height={100}
                                className='object-cover rounded-lg shadow-lg border border-gray-200 mb-2 image ms-20'
                                src={imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                data-pr-tooltip='Product Image'
                                alt='Product'
                            />

                            <Tooltip target='.upload' />
                            <label data-pr-tooltip='Upload Image' className='block cursor-pointer upload'>
                                <input
                                    onChange={handleImageUpload}
                                    type='file'
                                    ref={fileInputRef}
                                    accept='image/jpeg,image/png,image/gif,image/webp'
                                    className='hidden'
                                />
                                <span
                                    className='flex items-center justify-center p-4 bg-violet-50 rounded-lg text-gray-600'
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <i className='pi pi-image text-5xl mb-2'></i>
                                </span>
                            </label>

                            <Tooltip target='.gtin' />
                            <span className='gtin' data-pr-tooltip='QR Code'>
                                <QRCode
                                    size={200}
                                    style={{ height: 'auto', width: '120px' }}
                                    value={product.gtin}
                                    className='p-2'
                                    viewBox={`0 0 256 256`}
                                />
                            </span>
                        </div>
                    </div>
                </div>
                <Accordion className='mt-5' activeIndex={0}>
                    <AccordionTab header='Attributes'>
                        {attributeRows.map((row, index) => (
                            <div key={index} className='mb-4 grid grid-cols-3 items-center gap-4'>
                                <Dropdown
                                    value={attributeRows[index].selectedAttribute}
                                    options={[
                                        { id: 'add-new', name: '+ Thêm  thuộc tính' },
                                        ...getAvailableAttributes(),
                                        ...productAttributes.filter((attr) => attr.id === row.selectedAttribute?.id)
                                    ]}
                                    itemTemplate={(option) => (
                                        <div
                                            className={
                                                option.id === 'add-new'
                                                    ? 'text-green-600 rounded-lg bg-yellow-300 font-semibold text-center border-t border-gray-200 hover:bg-yellow-500'
                                                    : 'text-gray-800'
                                            }
                                        >
                                            {option.name}
                                        </div>
                                    )}
                                    onChange={(e) => {
                                        if (e.value.id === 'add-new') {
                                            setAtbDialogVisible(true)
                                        } else {
                                            const updatedRows = [...attributeRows]
                                            updatedRows[index].selectedAttribute = e.value
                                            setAttributeRows(updatedRows)
                                        }
                                    }}
                                    optionLabel='name'
                                    placeholder='Chọn một thuộc tính'
                                    className='w-[200px]'
                                    style={{ minWidth: '200px', width: '200px', maxWidth: '200px' }}
                                />
                                <AutoComplete
                                    value={attributeRows[index].selectedValues || ''}
                                    onChange={(e: AutoCompleteChangeEvent) => {
                                        const updatedRows = [...attributeRows]
                                        updatedRows[index].selectedValues = e.value
                                        setAttributeRows(updatedRows)
                                    }}
                                    placeholder='Nhập giá trị'
                                    className='w-52'
                                    suggestions={items}
                                    completeMethod={(event) => {
                                        const attribuetId = row.selectedAttribute?.id
                                        if (attribuetId !== undefined) {
                                            search(event, attribuetId)
                                        }
                                    }}
                                    dropdown
                                />
                                <Button
                                    tooltip='Xóa'
                                    onClick={() => removeAttributeRow(index)}
                                    className='pi pi-trash bg-gray-500 h-[3rem]'
                                />
                            </div>
                        ))}
                        <Button
                            disabled={isAddAttributeDisabled()}
                            onClick={addAttributeRow}
                            className='flex items-center mb-5'
                        >
                            <i className={PrimeIcons.PLUS}></i>
                            <span className='ml-2'>Thêm thuộc tính</span>
                        </Button>
                    </AccordionTab>
                </Accordion>
                <Button label='Lưu' onClick={handleSave} />
                <ConfirmDialog />
                <AtbDialog
                    visible={atbDialogVisible}
                    setVisible={setAtbDialogVisible}
                    productAttribute={productAttribute}
                    setProductAttribute={setProductAttribute}
                    submitted={submitted}
                    setSubmitted={setSubmitted}
                    hideDialog={hideDialog}
                    saveProductAttribute={saveProductAttribute}
                />
            </div>
        </div>
    )
}

export default ProductDetailsForm
