'use client'
import { Category } from '@/interface/category.interface'
import { ManufacturerName } from '@/interface/manufacturer.interface'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Editor } from 'primereact/editor'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Image } from 'primereact/image'
import ProductService from '@/service/ProducrService'
import { classNames } from 'primereact/utils'
import { Toast } from 'primereact/toast'
import RequiredIcon from '@/components/icon/RequiredIcon'

interface ProductAddFormProps {
    categories: Category[]
    manufacturers: ManufacturerName[]
    productAttributes: ProductAttributeName[]
    product: ProductResponse
    products: ProductResponseDetails[]
}

const ProductAddForm = ({ categories, manufacturers, product, products }: ProductAddFormProps) => {
    const [name, setName] = useState<string>('')
    const [weight, setWeight] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedManufacture, setSelectedManufacture] = useState<ManufacturerName | null>(null)
    const [text, setText] = useState<string>('')
    const [submitted, setSubmitted] = useState(false)
    const toast = useRef<Toast>(null)

    useEffect(() => {
        if (product) {
            setName(product.name)
            setWeight(product.weight || 0)
            setSelectedCategory(categories.find((c) => c.id === product.categoryId) || null)
            setSelectedManufacture(manufacturers.find((m) => m.id === product.manufacturerId) || null)
            setText(product.description || '')
        }
    }, [product, categories, manufacturers])

    const handleSave = async () => {
        setSubmitted(true)
        if (!name || !selectedCategory || !selectedManufacture || !weight) return

        await ProductService.updateProductParent(
            {
                name,
                weight,
                categoryId: selectedCategory?.id || 0,
                manufacturerId: selectedManufacture?.id || 0
            },
            product.id
        )
        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Sản phẩm đã được cập nhật thành công',
            life: 3000
        })

        setSubmitted(false)
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='flex justify-between items-center gap-2'>
                <h4>Cập Nhật Sản Phẩm</h4>
                <Link href={'/admin/products'}>
                    <Image src={'/layout/images/btn-back.png'} alt='ViStore' width='20' height='20' />
                </Link>
            </div>
            <div className='flex flex-column gap-4'>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='productName'>
                            Tên Sản Phẩm <RequiredIcon />
                        </label>
                        <InputText
                            tooltip='Nhập tên sản phẩm'
                            tooltipOptions={{ position: 'bottom' }}
                            id='productName'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Nhập tên sản phẩm'
                            className={classNames({ 'p-invalid': submitted && !name })}
                        />
                        {submitted && !name && <small className='p-error'>Tên sản phẩm là bắt buộc.</small>}
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='weight'>
                            Trọng Lượng <RequiredIcon />
                        </label>
                        <InputNumber
                            inputId='weight'
                            value={weight}
                            onValueChange={(e) => setWeight(e.value || 0)}
                            placeholder='Nhập trọng lượng'
                            mode='decimal'
                            showButtons
                            min={0}
                            suffix='g'
                            tooltip='Nhập trọng lượng của sản phẩm tính bằng grams'
                            tooltipOptions={{ position: 'bottom' }}
                            className={classNames({ 'p-invalid': submitted && !weight })}
                        />
                        {submitted && !weight && <small className='p-error'>Trọng lượng là bắt buộc.</small>}
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='category'>Danh Mục</label>
                        <Dropdown
                            inputId='category'
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.value)}
                            options={categories}
                            placeholder='Chọn một danh mục'
                            optionLabel='name'
                            tooltip='Chọn một danh mục cho sản phẩm'
                            tooltipOptions={{ position: 'bottom' }}
                            className={classNames({ 'p-invalid': submitted && !selectedCategory })}
                        />
                        {submitted && !selectedCategory && <small className='p-error'>Danh mục là bắt buộc.</small>}
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Nhà Sản Xuất</label>
                        <Dropdown
                            inputId='brand'
                            value={selectedManufacture}
                            onChange={(e) => setSelectedManufacture(e.value)}
                            options={manufacturers}
                            placeholder='Chọn một nhà sản xuất'
                            optionLabel='manufacturerName'
                            tooltip='Chọn một nhà sản xuất cho sản phẩm'
                            tooltipOptions={{ position: 'bottom' }}
                            className={classNames({ 'p-invalid': submitted && !selectedManufacture })}
                        />
                        {submitted && !selectedManufacture && (
                            <small className='p-error'>Nhà sản xuất là bắt buộc.</small>
                        )}
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='description'>Mô Tả</label>
                        <Editor
                            id='description'
                            value={text}
                            onTextChange={(e) => setText(e.htmlValue || '')}
                            style={{ height: '100px', width: '100%' }}
                            placeholder='Nhập mô tả cho sản phẩm'
                        />
                    </div>
                </div>

                <div>
                    <Link href={`/admin/products/product-add/${product.id}`}>
                        <Button label='Thêm chi tiết sản phẩm' className='float-right' />
                    </Link>
                </div>
                <DataTable
                    value={products}
                    tableStyle={{ minWidth: '50rem' }}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 500, 1000]}
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
                >
                    <Column
                        field=''
                        header='#'
                        body={(rowData, options: { rowIndex: number }) => options.rowIndex + 1}
                    ></Column>
                    <Column field='sku' header='SKU'></Column>
                    <Column field='name' header='Tên Sản Phẩm'></Column>
                    <Column field='quantity' header='Số Lượng'></Column>
                    <Column field='price' header='Giá'></Column>
                    <Column
                        header='Hình Ảnh'
                        body={(rowData) => (
                            <Image
                                src={rowData.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                width='50'
                                height='50'
                                alt={rowData.name || 'Product Image'}
                            />
                        )}
                    />
                    <Column
                        header='Thao Tác'
                        body={(rowData) => (
                            <Link href={`/admin/products/details/${rowData.id}`}>
                                <Button icon='pi pi-pencil' rounded outlined />
                            </Link>
                        )}
                    ></Column>
                </DataTable>

                <Button label='Lưu' onClick={handleSave} />
            </div>
        </div>
    )
}

export default ProductAddForm
