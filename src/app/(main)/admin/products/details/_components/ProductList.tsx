'use client'
import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse } from '@/interface/Product'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import Link from 'next/link'
import { Image } from 'primereact/image'

type Props = {
    products: ProductResponse[]
}

function ProductList({ products }: Props) {
    const [filters, setFilters] = useState<{
        global: { value: string | null; matchMode: FilterMatchMode }
        name: { value: string | null; matchMode: FilterMatchMode }
        categoryName: { value: string | null; matchMode: FilterMatchMode }
        manufacturerName: { value: string | null; matchMode: FilterMatchMode }
    }>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        categoryName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        manufacturerName: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    const [globalFilterValue, setGlobalFilterValue] = useState('')

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const _filters = { ...filters }
        _filters['global'].value = value
        setFilters(_filters)
        setGlobalFilterValue(value)
    }

    const indexBodyTemplate = (_: ProductResponse, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }

    const header = (
        <div className='flex justify-content-between items-center'>
            <span className='p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder='Tìm kiếm...'
                    className='w-full'
                />
            </span>
            <div className='flex gap-2 items-center'>
                <Link href='/admin/products/add'>
                    <Button label='Thêm Mới' />
                </Link>
            </div>
        </div>
    )

    return (
        <div className='card'>
            <h2>Danh Sách Sản Phẩm</h2>
            <DataTable
                value={products}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                filters={filters}
                globalFilterFields={['name', 'categoryName', 'manufacturerName']}
                tableStyle={{ minWidth: '50rem' }}
                header={header}
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
            >
                <Column
                    header='#'
                    body={indexBodyTemplate}
                    headerStyle={{
                        width: '4rem'
                    }}
                />
                <Column
                    header='Hình Ảnh'
                    body={(rowData) => (
                        <Image
                            src={rowData.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                            width='70px'
                            height='70px'
                            imageClassName='rounded-lg'
                            alt={rowData.name ?? 'Product Image'}
                            onError={(e) =>
                                ((e.target as HTMLImageElement).src =
                                    '/demo/images/default/—Pngtree—sneakers_3989154.png')
                            }
                        />
                    )}
                />
                <Column field='name' header='Tên Sản Phẩm' filter filterPlaceholder='Lọc theo tên' />
                <Column field='categoryName' header='Danh Mục' filter filterPlaceholder='Lọc theo danh mục' />
                <Column
                    field='manufacturerName'
                    header='Nhà Sản Xuất'
                    filter
                    filterPlaceholder='Lọc theo nhà sản xuất'
                />
                <Column sortable align='center' field='quantity' header='Số Lượng' />

                <Column
                    header='Thao Tác'
                    body={(rowData) => (
                        <Link href={`/admin/products/${rowData.id}`}>
                            <Button icon='pi pi-pencil' rounded outlined />
                        </Link>
                    )}
                />
            </DataTable>
        </div>
    )
}

export default ProductList
