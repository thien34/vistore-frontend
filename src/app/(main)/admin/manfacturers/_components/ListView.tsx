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
import { Manufacturer } from '@/interface/manufacturer.interface'
import manufacturerService from '@/service/manufacturer.service'
import RequiredIcon from '@/components/icon/RequiredIcon'

interface ManufacturerProps {
    initialData: Manufacturer[]
}

const emptyManufacturer: Manufacturer = {
    name: '',
    description: ''
}

const ListView = ({ initialData }: ManufacturerProps) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>(initialData)
    const [manufacturer, setManufacturer] = useState<Manufacturer>(emptyManufacturer)
    const [selectedManufacturers, setSelectedManufacturers] = useState<Manufacturer>()
    const [submitted, setSubmitted] = useState(false)
    const [manufacturerDialog, setManufacturerDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Manufacturer[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setManufacturer(emptyManufacturer)
        setSubmitted(false)
        setManufacturerDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setManufacturerDialog(false)
    }

    const editManufacturer = (manufacturer: Manufacturer) => {
        setManufacturer({ ...manufacturer })
        setManufacturerDialog(true)
    }

    const fetchManufacturers = async () => {
        const { payload: data } = await manufacturerService.getAll()
        setManufacturers(data.items)
    }

    const saveManufacturer = async () => {
        setSubmitted(true)
        if (manufacturer.name.trim()) {
            if (!manufacturer.id) {
                await manufacturerService.create(manufacturer)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Nhà sản xuất đã tạo thành công',
                    life: 3000
                })
            } else {
                await manufacturerService.update(manufacturer.id, manufacturer)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Nhà sản xuất đã cập nhật thành công',
                    life: 3000
                })
            }
            setManufacturerDialog(false)
            await fetchManufacturers()
        }
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button label='New' icon='pi pi-plus' severity='success' onClick={openNew} />
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

    const actionBodyTemplate = (rowData: Manufacturer) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => editManufacturer(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Quản lý Nhà Sản Xuất</h5>
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

    const manufacturerDialogFooter = (
        <>
            <Button label='Hủy' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Lưu' icon='pi pi-check' onClick={saveManufacturer} />
        </>
    )
    const indexBodyTemplate = (_: Manufacturer, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }
    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={manufacturers}
                    selection={selectedManufacturers}
                    onSelectionChange={(e) => setSelectedManufacturers(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} nhà sản xuất'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy nhà sản xuất nào'
                    header={header}
                >
                    <Column
                        header='#'
                        body={indexBodyTemplate}
                        headerStyle={{
                            width: '4rem'
                        }}
                    />

                    <Column
                        field='name'
                        header='Tên Nhà Sản Xuất'
                        sortable
                        headerStyle={{
                            minWidth: '4rem'
                        }}
                    />
                    <Column field='description' header='Mô Tả' />
                    <Column
                        header='Chi Tiết'
                        body={actionBodyTemplate}
                        style={{
                            maxWidth: '30px'
                        }}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={manufacturerDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Chi Tiết Nhà Sản Xuất'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={manufacturerDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Name <RequiredIcon />
                    </label>
                    <InputText
                        id='name'
                        value={manufacturer.name}
                        onChange={(e) => setManufacturer({ ...manufacturer, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !manufacturer.name })}
                    />
                    {submitted && !manufacturer.name && <small className='p-error'>Name is required.</small>}
                </div>
                <div className='field'>
                    <label htmlFor='description' className='font-bold'>
                        Description
                    </label>
                    <InputText
                        id='description'
                        value={manufacturer.description}
                        onChange={(e) => setManufacturer({ ...manufacturer, description: e.target.value })}
                        required
                    />
                </div>
            </Dialog>
        </>
    )
}

export default ListView
