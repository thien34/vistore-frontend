'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { DataTable, DataTableRowEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import ProductService from '@/service/ProducrService'
import { Image } from 'primereact/image'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import discountService from '@/service/discount.service'
import { useRouter } from 'next/navigation'

const DiscountForm = () => {
    const toast = useRef<Toast>(null)
    const [discountName, setDiscountName] = useState<string>('')
    const [value, setValue] = useState<number | null>(null)
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [selectedProducts, setSelectedProducts] = useState<ProductResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [fetchedProducts, setFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [selectedFetchedProducts, setSelectedFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [discountTypeId] = useState<number>(1)
    const [usePercentage] = useState<boolean>(true)
    const [comments, setComments] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [minStartDate, setMinStartDate] = useState<Date | undefined>(new Date())
    const [minEndDate, setMinEndDate] = useState<Date | undefined>(undefined)
    const [errors, setErrors] = useState<{
        discountName: string | null
        value: string | null
        fromDate: string | null
        toDate: string | null
        dateError: string | null
        productError: string | null
    }>({
        discountName: null,
        value: null,
        fromDate: null,
        toDate: null,
        dateError: null,
        productError: null
    })
    const router = useRouter()
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const showSuccessToast = () => {
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Giảm giá được tạo thành công!' })
    }
    useEffect(() => {
        const now = new Date()
        setMinStartDate(now)

        if (fromDate) {
            const minEndDateTime = new Date(fromDate.getTime() + 60 * 60 * 1000)
            setMinEndDate(minEndDateTime)
        } else {
            setMinEndDate(null)
        }
    }, [fromDate])
    const handleProductNameClick = (productId: string) => {
        router.push(`/admin/products/details/${productId}`)
    }
    const showFailedToast = (errorMessage: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: errorMessage || 'Giảm giá được tạo thất bại!'
        })
    }

    const handleCreateDiscount = () => {
        if (!validateForm()) {
            showFailedToast('Xác thực biểu mẫu không thành công. Vui lòng sửa các trường.')
            return
        }

        const discountPayload = {
            name: discountName,
            comment: comments,
            discountTypeId: discountTypeId,
            usePercentage: true,
            discountPercentage: usePercentage ? (value !== null ? value : undefined) : undefined,
            startDateUtc: fromDate?.toISOString(),
            endDateUtc: toDate?.toISOString(),
            selectedProductVariantIds: selectedFetchedProducts.map((product) => product.id)
        }

        discountService
            .createDiscount(discountPayload)
            .then(() => {
                showSuccessToast()
                setDiscountName('')
                setValue(null)
                setFromDate(null)
                setToDate(null)
                setSelectedProducts([])
                setSelectedFetchedProducts([])
                setComments('')
                router.push('/admin/discounts')
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    const backendMessage = error.response.data.message
                    if (backendMessage && backendMessage.includes('Giảm giá với tên này đã tồn tại')) {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            discountName: 'Tên giảm giá này đã được sử dụng.'
                        }))
                    } else {
                        showFailedToast(backendMessage || 'Đã xảy ra lỗi.')
                    }
                } else {
                    showFailedToast('Đã xảy ra lỗi không mong muốn.')
                }
            })
    }

    const validateForm = () => {
        let isValid = true
        const newErrors: {
            discountName: string | null
            value: string | null
            fromDate: string | null
            toDate: string | null
            dateError: string | null
            productError: string | null
        } = {
            discountName: null,
            value: null,
            fromDate: null,
            toDate: null,
            dateError: null,
            productError: null
        }

        if (!discountName.trim()) {
            newErrors.discountName = 'Tên giảm giá là bắt buộc'
            isValid = false
        }

        if (value === null || isNaN(value) || value <= 0) {
            newErrors.value = 'Vui lòng nhập giá trị chiết khấu dương hợp lệ.'
            isValid = false
        } else if (value > 50) {
            newErrors.value = 'Bạn không thể đặt mức giảm giá cao hơn 50%.'
            isValid = false
        }

        if (!fromDate) {
            newErrors.fromDate = 'Ngày bắt đầu là bắt buộc.'
            isValid = false
        } else if (isNaN(fromDate.getTime())) {
            newErrors.fromDate = 'Ngày bắt đầu không hợp lệ'
            isValid = false
        }

        if (!toDate) {
            newErrors.toDate = 'Ngày kết thúc là bắt buộc'
            isValid = false
        } else if (isNaN(toDate.getTime())) {
            newErrors.toDate = 'Ngày kết thúc không hợp lệ'
            isValid = false
        }

        if (fromDate && toDate) {
            const durationInMs = toDate.getTime() - fromDate.getTime()
            const durationInHours = durationInMs / (1000 * 60 * 60)
            const durationInDays = durationInMs / (1000 * 60 * 60 * 24)

            if (durationInDays > 180) {
                newErrors.dateError = 'Thời lượng của chương trình không được vượt quá 180 ngày.'
                isValid = false
            } else if (fromDate > toDate) {
                newErrors.dateError = 'Ngày bắt đầu không thể sau ngày kết thúc.'
                isValid = false
            } else if (durationInHours < 1) {
                newErrors.dateError = 'Thời lượng chương trình phải ít nhất là 1 giờ.'
                isValid = false
            }
        }

        if (selectedFetchedProducts.length === 0) {
            newErrors.productError = 'Phải chọn ít nhất một sản phẩm.'
            isValid = false
        } else if (selectedFetchedProducts.some((product) => product.quantity <= 1)) {
            newErrors.productError = 'Tất cả các biến thể được chọn phải có số lượng lớn hơn 1.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleRowSelect = (event: DataTableRowEvent) => {
        const selectedProductId = event.data.id
        console.log('ID biến thể sản phẩm đã chọn:', selectedProductId)
    }

    const onProductSelectionChange = async (e: any) => {
        const newSelectedProducts = e.value as ProductResponse[]
        setSelectedProducts(newSelectedProducts)

        const selectedIds = newSelectedProducts.map((product) => product.id)
        if (selectedIds.length > 0) {
            try {
                const productsByParentIds = await ProductService.getProductsByParentIds(selectedIds)
                setFetchedProducts(productsByParentIds)
            } catch (error) {
                console.error('Lỗi tìm nạp sản phẩm theo ID gốc:', error)
            }
        } else {
            setFetchedProducts([])
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            const productData = await ProductService.getAllProducts()
            setProducts(productData)
        }
        fetchProducts()
    }, [])

    const onFetchedProductsSelectionChange = (e: any) => {
        setSelectedFetchedProducts(e.value as ProductResponseDetails[])
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='p-fluid grid'>
                <div className='col-12 md:col-6'>
                    <h3>Tạo Giảm Giá</h3>

                    <div className='field'>
                        <label htmlFor='discountName'>Tên Giảm Giá</label>
                        <InputText
                            id='discountName'
                            value={discountName}
                            onChange={(e) => setDiscountName(e.target.value)}
                            required
                            placeholder='Nhập tên giảm giá'
                        />
                        {errors.discountName && <small className='p-error'>{errors.discountName}</small>}
                    </div>

                    <div className='field'>
                        <label htmlFor='value'>Giá trị giảm giá</label>
                        <InputNumber                            inputId='value'
                            value={value}
                            mode='decimal'
                            onValueChange={(e) => setValue(e.value !== undefined ? e.value : null)}
                            suffix='%'
                            min={1}
                            max={50}
                            required
                            placeholder='Nhập giá trị giảm giá'
                        />
                        {errors.value && <small className='p-error'>{errors.value}</small>}
                    </div>

                    <div className='flex justify-between'>
                        <div className='field'>
                            <label htmlFor='fromDate'>Ngày bắt đầu</label>
                            <Calendar
                                id='fromDate'
                                value={fromDate}
                                showIcon
                                onChange={(e) => {
                                    const selectedDate = e.value as Date | null
                                    setFromDate(selectedDate)
                                }}
                                minDate={minStartDate}
                                showTime
                                hourFormat='12'
                                touchUI
                                dateFormat='dd/mm/yy'
                                placeholder='Chọn ngày bắt đầu'
                                showButtonBar
                                required
                            />
                            {errors.fromDate && <small className='p-error'>{errors.fromDate}</small>}
                        </div>

                        <div className='field'>
                            <label htmlFor='toDate'>Ngày Kết Thúc</label>
                            <Calendar
                                id='toDate'
                                value={toDate}
                                onChange={(e) => {
                                    const selectedDate = e.value as Date | null
                                    setToDate(selectedDate)
                                }}
                                showTime
                                touchUI
                                showIcon
                                minDate={minEndDate}
                                dateFormat='dd/mm/yy'
                                placeholder='Chọn ngày kết thúc'
                                showButtonBar
                                required
                                hourFormat='12'
                            />
                            {errors.toDate && <small className='p-error'>{errors.toDate}</small>}
                            {errors.dateError && <small className='p-error'>{errors.dateError}</small>}
                        </div>
                    </div>
                    <div className='flex justify-center gap-2 items-center space-x-2 my-3'>
                        <InputTextarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder='Bình Luận'
                            rows={5}
                            cols={30}
                        />
                    </div>
                    <Button
                        className='mt-4'
                        label='Tạo Giảm Giá'
                        icon='pi pi-check'
                        onClick={handleCreateDiscount}
                    />
                </div>

                <div className='col-12 md:col-6'>
                    <h4>Chọn Sản Phẩm</h4>
                    <div className='field'>
                        <InputText
                            id='productSearch'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Tìm theo tên sản phẩm'
                        />
                    </div>
                    <DataTable
                        value={filteredProducts}
                        paginator
                        rows={9}
                        dataKey='id'
                        selection={selectedProducts}
                        onSelectionChange={onProductSelectionChange}
                        selectionMode='checkbox'
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                        <Column field='id' header='#' />
                        <Column field='name' header='Tên Sản Phẩm' sortable />
                    </DataTable>
                </div>
            </div>
            {fetchedProducts.length > 0 && (
                <div className='col-12'>
                    <h4 className='text-lg font-semibold mb-4'>Biến Thể Sản Phẩm</h4>
                    {errors.productError && <small className='p-error'>{errors.productError}</small>}
                    <DataTable
                        value={fetchedProducts}
                        paginator
                        rows={10}
                        dataKey='id'
                        selection={selectedFetchedProducts}
                        onSelectionChange={onFetchedProductsSelectionChange}
                        onRowSelect={handleRowSelect}
                        selectionMode='checkbox'
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                        <Column
                            field='name'
                            header='Tên Sản Phẩm'
                            body={(rowData) => (
                                <Button
                                    label={rowData.name}
                                    className='p-button-text'
                                    onClick={() => handleProductNameClick(rowData.id)}
                                />
                            )}
                            sortable
                        />
                        <Column
                            field='imageUrl'
                            header='Hình Ảnh'
                            body={(rowData) => (
                                <Image
                                    src={rowData.imageUrl}
                                    alt={rowData.name}
                                    width='100px'
                                    height='100px'
                                    className='object-cover'
                                    preview
                                />
                            )}
                        />
                        <Column sortable field='categoryName' header='Tên Danh Mục' />
                        <Column sortable field='quantity' header='Số Lượng' />
                        <Column sortable field='manufacturerName' header='Tên Nhà Sản Xuất' />
                        <Column sortable field='sku' header='SKU' />
                    </DataTable>
                </div>
            )}
        </div>
    )
}

export default DiscountForm
