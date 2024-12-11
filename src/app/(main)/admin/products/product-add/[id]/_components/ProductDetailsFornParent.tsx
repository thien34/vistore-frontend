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
import { useRouter } from 'next/navigation'
import RequiredIcon from '@/components/icon/RequiredIcon'
import productAttributeService from '@/service/productAttribute.service'
import { useMountEffect } from 'primereact/hooks'
import AtbDialog from '../../../add/_components/AtbDialog'
import Link from 'next/link'
type AttributeRow = {
    selectedAttribute: ProductAttributeName | null
    selectedValues: string | undefined
}

type Props = {
    product?: ProductResponseDetails | typeof initialFormData
    id: string
    name: string
}

const initialFormData: ProductResponseDetails = {
    id: 0,
    name: '',
    deleted: false,
    categoryId: 0,
    manufacturerId: 0,
    sku: '',
    price: 0,
    quantity: 0,
    productCost: 0,
    imageUrl: '',
    gtin: '',
    discountPrice: 0,
    attributes: [],
    largestDiscountPercentage: 0,
    weight: 0
}
const emptyProductAttribute: ProductAttribute = {
    name: '',
    description: ''
}
const ProductDetailsFormParent: React.FC<Props> = ({ product, id, name }) => {
    const [formData, setFormData] = useState<ProductResponseDetails>(
        (product as ProductResponseDetails) || initialFormData
    )
    const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl || '')
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [discount, setDiscount] = useState(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useRef<Toast>(null)
    const router = useRouter()
    const [submitted, setSubmitted] = useState(false)
    const [productAttribute, setProductAttribute] = useState<ProductAttribute>(emptyProductAttribute)
    const [atbDialogVisible, setAtbDialogVisible] = useState(false)
    const [productAttributes, setProductAttributes] = useState<ProductAttributeName[]>([])
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>(
        product?.attributes?.map((attr) => ({
            selectedAttribute: { id: attr.id, name: attr.name },
            selectedValues: attr.value
        })) || []
    )
    useMountEffect(() => {
        fetchAttributes()
    })
    const fetchAttributes = async () => {
        const response = await productAttributeService.getListName()
        setProductAttributes(response.payload)
    }
    const [errors, setErrors] = useState({
        sku: '',
        price: '',
        name: '',
        quantity: '',
        productCost: '',
        attributes: ''
    })

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
                detail: 'Vui lòng thêm ít nhất 1 thuộc tính',
                life: 3000
            })
            return
        }
        const productData = {
            id: null,
            name: name,
            deleted: formData.deleted,
            categoryId: formData.categoryId,
            manufacturerId: formData.manufacturerId,
            sku: formData.sku,
            unitPrice: formData.price,
            quantity: formData.quantity,
            productCost: formData.productCost,
            attributes: filteredAttributes,
            gtin: formData.gtin,
            imageUrl: product?.imageUrl || ''
        }

        if (uploadedFile) {
            const imageRes = await PictureService.savePicture(uploadedFile)
            productData.imageUrl = imageRes
        }

        try {
            await ProductService.addChildProduct(+id, productData).then(() => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Sản phẩm được thêm thành công',
                    life: 3000
                })
                router.push(`/admin/products/${id}`)
            })
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
                life: 3000
            })
            console.error('Không cập nhật được sản phẩm:', error)
        }
    }

    const addAttributeRow = () => {
        setAttributeRows([...attributeRows, { selectedAttribute: null, selectedValues: '' }])
    }

    const removeAttributeRow = (index: number) => {
        setAttributeRows((prevRows) => prevRows.filter((_, i) => i !== index))
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
                console.error('Error fetching discounts: ', error)
            }
        }

        if (product?.id) {
            fetchDiscounts(product.id)
        }
    }, [product])

    const fetchValues = async (attribuetId: number) => {
        try {
            const { payload } = await AttributeValueService.getAttributeValues(product?.id || 0, attribuetId)

            if (!Array.isArray(payload)) return []

            const uniqueNames = Array.from(new Set(payload.map((value) => value.name)))

            return uniqueNames
        } catch (error) {
            console.error('Lỗi khi tìm giá trị thuộc tính:', error)
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
                <h5>Thêm Chi Tiết Sản Phẩm</h5>
                <Link href={`/admin/products/${id}`}>
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
                                value={(formData && formData.sku) || ''}
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
                        <div className='flex flex-column gap-2 w-full '>
                            <label htmlFor='productName'>Tên Sản Phẩm</label>
                            <InputText
                                id='productName'
                                disabled
                                tooltipOptions={{ position: 'bottom' }}
                                value={name}
                                onChange={(e) => handleChange(e, 'name')}
                                className={errors.name ? 'p-invalid' : ''}
                            />
                            {errors.name && <small className='p-error'>{errors.name}</small>}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='price' className='mb-2'>
                                Giá <RequiredIcon />
                            </label>
                            <InputNumber
                                tooltip='Nhập giá sản phẩm'
                                inputId='price'
                                tooltipOptions={{ position: 'bottom' }}
                                value={(formData && formData.price) || 0}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, price: 'Giá phải lớn hơn 0' })
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
                                className={discount ? 'p-disabled' : errors.price ? 'p-invalid' : ''}
                                currency='VND'
                                locale='vi-VN'
                                max={1000000}
                            />
                            {errors.price && <small className='p-error'>{errors.price}</small>}
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='productCost'>
                                Giá Nhập <RequiredIcon />
                            </label>
                            <InputNumber
                                tooltip='Nhập giá nhập cho sản phẩm'
                                inputId='productCost'
                                tooltipOptions={{ position: 'bottom' }}
                                value={(formData && formData.productCost) || 0}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, productCost: 'Giá nhập phải lớn hơn 0' })
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
                                max={1000000}
                                mode='currency'
                                className={errors.productCost ? 'p-invalid' : ''}
                                currency='VND'
                                locale='vi-VN'
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
                                value={(formData && formData.quantity) || 0}
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
                                max={1000000}
                                className={errors.quantity ? 'p-invalid' : ''}
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
                                <input onChange={handleImageUpload} type='file' ref={fileInputRef} className='hidden' />
                                <span
                                    className='flex items-center justify-center p-4 bg-violet-50 rounded-lg text-gray-600'
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <i className='pi pi-image text-5xl mb-2'></i>
                                </span>
                            </label>

                            <Tooltip target='.gtin' />
                            <span className='gtin hidden' data-pr-tooltip='QR Code'>
                                <QRCode
                                    size={200}
                                    style={{ height: 'auto', width: '120px' }}
                                    value={product?.gtin || ''}
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
                                    tooltip='Delete'
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
                <Button label='Save' onClick={handleSave} />
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

export default ProductDetailsFormParent
