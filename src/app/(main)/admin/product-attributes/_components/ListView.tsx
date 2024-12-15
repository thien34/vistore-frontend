'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { classNames } from 'primereact/utils'
import { ProductAttribute } from '@/interface/productAttribute.interface'
import productAttributeService from '@/service/productAttribute.service'
import RequiredIcon from '@/components/icon/RequiredIcon'

interface ProductAttributeProps {
    initialData: ProductAttribute[]
}

const emptyProductAttribute: ProductAttribute = {
    name: '',
    description: ''
}

const ListView = ({ initialData }: ProductAttributeProps) => {
    const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>(initialData)
    const [productAttribute, setProductAttribute] = useState<ProductAttribute>(emptyProductAttribute)
    const [selectedProductAttributes, setSelectedProductAttributes] = useState<ProductAttribute>()
    const [submitted, setSubmitted] = useState(false)
    const [productAttributeDialog, setProductAttributeDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<ProductAttribute[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setProductAttribute(emptyProductAttribute)
        setSubmitted(false)
        setProductAttributeDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setProductAttributeDialog(false)
    }

    const editProductAttribute = (productAttribute: ProductAttribute) => {
        setProductAttribute({ ...productAttribute })
        setProductAttributeDialog(true)
    }

    const fetchProductAttributes = async () => {
        const { payload: data } = await productAttributeService.getAll()
        setProductAttributes(data.items)
    }

    const saveProductAttribute = async () => {
        setSubmitted(true)
        if (productAttribute.name.trim()) {
            if (!productAttribute.id) {
                await productAttributeService.create(productAttribute)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Thuộc tính sản phẩm đã được tạo',
                    life: 3000
                })
            } else {
                await productAttributeService.update(productAttribute.id, productAttribute)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Thuộc tính sản phẩm đã được cập nhật',
                    life: 3000
                })
            }
            setProductAttributeDialog(false)
            await fetchProductAttributes()
        }
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button label='Thêm mới' icon='pi pi-plus' severity='success' onClick={openNew} />
            </div>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <>
                <FileUpload
                    mode='basic'
                    accept='image/*'
                    maxFileSize={1000000}
                    chooseLabel='Nhập File'
                    className='mr-2 inline-block'
                />
                <Button label='Xuất File' icon='pi pi-upload' severity='help' onClick={exportCSV} />
            </>
        )
    }

    const descriptionBodyTemplate = (rowData: ProductAttribute) => {
        return (
            <div
                className='overflow-hidden text-ellipsis whitespace-nowrap'
                style={{ maxWidth: '500px' }}
                title={rowData.description}
            >
                {rowData.description}
            </div>
        )
    }

    const actionBodyTemplate = (rowData: ProductAttribute) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => editProductAttribute(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Quản lý thuộc tính</h5>
            <span className='block mt-2 md:mt-0 p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    type='search'
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder='Tìm kiếm...'
                />
            </span>
        </div>
    )

    const productAttributeDialogFooter = (
        <>
            <Button label='Hủy' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Lưu' icon='pi pi-check' onClick={saveProductAttribute} />
        </>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={productAttributes}
                    selection={selectedProductAttributes}
                    onSelectionChange={(e) => setSelectedProductAttributes(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy thuộc tính sản phẩm.'
                    header={header}
                >
                    <Column
                        selectionMode='multiple'
                        headerStyle={{
                            width: '4rem'
                        }}
                    ></Column>
                    <Column
                        field='name'
                        header='Tên'
                        sortable
                        headerStyle={{
                            minWidth: '4rem'
                        }}
                    />
                    <Column
                        field='description'
                        header='Mô Tả'
                        sortable
                        body={descriptionBodyTemplate}
                        headerStyle={{ width: '200px' }}
                    />
                    <Column
                        body={actionBodyTemplate}
                        style={{
                            maxWidth: '30px'
                        }}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={productAttributeDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Chi tiết thuộc tính sản phẩm'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={productAttributeDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Tên thuộc tính<RequiredIcon />
                    </label>
                    <InputText
                        id='name'
                        value={productAttribute.name}
                        onChange={(e) => setProductAttribute({ ...productAttribute, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !productAttribute.name })}
                    />
                    {submitted && !productAttribute.name && <small className='p-error'>Tên thuộc tính là bắt buộc.</small>}
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

export default ListView
