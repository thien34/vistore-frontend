'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { useRef, useState } from 'react'
import { Customer } from '@/interface/customer.interface'
import { useRouter } from 'next/navigation'

interface CustomerProps {
    initialData: Customer[]
}

const ListView = ({ initialData }: CustomerProps) => {
    const [selectedCustomers, setSelectedCustomers] = useState<Customer>()
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Customer[]>>(null)
    const router = useRouter()

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    label='Thêm Mới'
                    icon='pi pi-plus'
                    severity='success'
                    onClick={() => router.push('/admin/customers/add')}
                />
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

    const actionBodyTemplate = (rowData: Customer) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => router.push(`/admin/customers/${rowData.id}`)}
                />
            </>
        )
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Quản Lý Khách Hàng</h5>
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

    const indexBodyTemplate = (_: Customer, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={initialData}
                    selection={selectedCustomers}
                    onSelectionChange={(e) => setSelectedCustomers(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} khách hàng'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy khách hàng nào'
                    header={header}
                >
                    <Column
                        headerStyle={{
                            width: '4rem'
                        }}
                        header='#'
                        body={indexBodyTemplate}
                    ></Column>
                    <Column field='email' header='Email' sortable />
                    <Column
                        field='name'
                        header='Tên Khách Hàng'
                        body={(rowData: Customer) => `${rowData.firstName} ${rowData.lastName}`}
                        sortable
                    />
                    <Column field='customerRoles' header='Vai Trò' sortable />
                    <Column field='active' header='Trạng Thái' sortable />
                    <Column header='Thao Tác' body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
        </>
    )
}

export default ListView
