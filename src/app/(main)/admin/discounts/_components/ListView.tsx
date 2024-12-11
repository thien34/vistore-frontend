'use client'

import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Slider, SliderChangeEvent } from 'primereact/slider'
import { useRef, useState, useEffect } from 'react'
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Promotion } from '@/interface/discount.interface'
import discountService from '@/service/discount.service'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import Link from 'next/link'
import { classNames } from 'primereact/utils'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'

dayjs.extend(utc)
dayjs.extend(timezone)

const vietnamTime = (date: string) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')

const ListView = () => {
    const [discounts, setDiscounts] = useState<Promotion[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<Promotion[]>([])
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        discountName: '',
        discountPercentage: [0, 100]
    })
    const toast = useRef<Toast>(null)
    useEffect(() => {
        const fetchDiscounts = async () => {
            const response = await discountService.getAll()
            setDiscounts(response)
            setFilteredDiscounts(response)
        }

        fetchDiscounts()
    }, [])

    const formatDiscountAndStock = (rowData: any) => {
        const stockClassName = classNames(
            'border-circle w-4rem h-4rem inline-flex font-bold justify-content-center align-items-center text-sm',
            {
                'bg-green-100 text-green-900': rowData.discountPercentage >= 1 && rowData.discountPercentage < 10,
                'bg-yellow-100 text-yellow-900': rowData.discountPercentage >= 10 && rowData.discountPercentage < 20,
                'bg-orange-100 text-orange-900': rowData.discountPercentage >= 20 && rowData.discountPercentage < 30,
                'bg-teal-100 text-teal-900': rowData.discountPercentage >= 30 && rowData.discountPercentage < 40,
                'bg-blue-100 text-blue-900': rowData.discountPercentage >= 40 && rowData.discountPercentage < 50,
                'bg-red-100 text-red-900': rowData.discountPercentage >= 50
            }
        )

        return (
            <div className='flex flex-column align-items-start'>
                <div className={stockClassName}>{rowData.discountPercentage} %</div>
            </div>
        )
    }

    const handleSearch = () => {
        const filtered = discounts.filter((discount) => {
            const matchStartDate = searchParams.startDate
                ? dayjs(discount.startDateUtc).isAfter(searchParams.startDate)
                : true
            const matchEndDate = searchParams.endDate ? dayjs(discount.endDateUtc).isBefore(searchParams.endDate) : true
            const matchDiscountName = searchParams.discountName
                ? discount.name.toLowerCase().includes(searchParams.discountName.toLowerCase())
                : true
            const matchDiscountPercentage =
                discount.discountPercentage >= searchParams.discountPercentage[0] &&
                discount.discountPercentage <= searchParams.discountPercentage[1]

            return matchStartDate && matchEndDate && matchDiscountName && matchDiscountPercentage
        })

        setFilteredDiscounts(filtered)
    }

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Link href='/admin/discounts/add'>
                <Button label='Thêm giảm giá mới' icon='pi pi-plus' severity='success' />
            </Link>
        </div>
    )

    const statusBodyTemplate = (discount: Promotion) => {
        const { severity, icon } = getStatus(discount.status)
        return <Tag value={discount.status} severity={severity} icon={icon} />
    }
    const statuses: string[] = ['UPCOMING', 'ACTIVE', 'EXPIRED', 'CANCEL']

    const statusFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e: DropdownChangeEvent) => options.filterCallback(e.value, options.index)}
                itemTemplate={statusItemTemplate}
                placeholder='Chọn một'
                className='p-column-filter'
                showClear
            />
        )
    }
    const statusItemTemplate = (option: string) => {
        const { severity, icon } = getStatus(option)
        return <Tag value={option} icon={icon} severity={severity} />
    }

    type SeverityType = 'success' | 'info' | 'danger' | 'warning' | null

    const getStatus = (status: string): { severity: SeverityType; icon: string | null } => {
        switch (status) {
            case 'ACTIVE':
                return { severity: 'success', icon: 'pi pi-check' }
            case 'UPCOMING':
                return { severity: 'info', icon: 'pi pi-info-circle' }
            case 'EXPIRED':
                return { severity: 'danger', icon: 'pi pi-times' }
            case 'CANCEL':
                return { severity: 'warning', icon: 'pi pi-exclamation-triangle' }
            default:
                return { severity: null, icon: null }
        }
    }

    const handleCancelDiscount = async (promotionId: string) => {
        try {
            await discountService.cancelDiscount(promotionId)

            const updatedDiscounts = discounts.map((discount) =>
                discount.id === promotionId ? { ...discount, status: 'CANCEL' } : discount
            )
            setDiscounts(updatedDiscounts)
            setFilteredDiscounts(updatedDiscounts)

            toast.current?.show({
                severity: 'success',
                summary: 'Status Updated',
                detail: 'Promotion marked as cancelled successfully!',
                life: 3000
            })
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error cancelling promotion',
                life: 3000
            })
        }
    }

    const editAndExpiredButtonTemplate = (rowData: Promotion) => {
        return (
            <div className='flex gap-2'>
                {rowData.status !== 'CANCEL' && (
                    <Link href={`/admin/discounts/${rowData.id}`}>
                        <Button icon='pi pi-pencil' severity='info' aria-label='Edit' rounded />
                    </Link>
                )}
                {rowData.status === 'ACTIVE' && (
                    <Button
                        icon='pi pi-times'
                        severity='danger'
                        aria-label='Expire'
                        onClick={() => openConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
                {rowData.status === 'UPCOMING' && (
                    <Button
                        icon='pi pi-trash'
                        severity='warning'
                        aria-label='Notification'
                        onClick={() => openCancelConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
            </div>
        )
    }

    const openCancelConfirmDialog = (promotionId: string) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn hủy khuyến mãi này không?',
            header: 'Xác nhận hủy',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Cancel',
            rejectLabel: 'No, Keep',
            accept: () => handleCancelDiscount(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Action cancelled.',
                    life: 3000
                })
            }
        })
    }

    const handleConfirmExpired = async (promotionId: string) => {
        try {
            await discountService.markAsExpired(promotionId)

            const updatedDiscounts = discounts.map((discount) =>
                discount.id === promotionId
                    ? { ...discount, status: 'EXPIRED', endDateUtc: new Date().toISOString() }
                    : discount
            )
            setDiscounts(updatedDiscounts)
            setFilteredDiscounts(updatedDiscounts)

            toast.current?.show({
                severity: 'success',
                summary: 'Status Updated',
                detail: 'Khuyến mại được đánh dấu là đã hết hạn và ngày kết thúc được đặt thành bây giờ!',
                life: 3000
            })
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Lỗi đánh dấu khuyến mại là đã hết hạn',
                life: 3000
            })
        }
    }

    const openConfirmDialog = (promotionId: string) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn đánh dấu khuyến mãi này là đã hết hạn không?',
            header: 'Xác Nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => handleConfirmExpired(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Action cancelled.',
                    life: 3000
                })
            }
        })
    }
    const indexBodyTemplate = (_: Promotion, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className='card'>
                <Card title='Tìm Kiếm' className='mb-4'>
                    <div className='p-fluid grid formgrid'>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='startDate'>Ngày Bắt Đầu</label>
                            <Calendar
                                id='startDate'
                                value={searchParams.startDate}
                                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.value })}
                                dateFormat='dd/mm/yy'
                                showIcon
                                placeholder='Chọn ngày bắt đầu'
                            />
                        </div>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='endDate'>Ngày Kết Thúc</label>
                            <Calendar
                                id='endDate'
                                value={searchParams.endDate}
                                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.value })}
                                dateFormat='dd/mm/yy'
                                showIcon
                                placeholder='Chọn ngày kết thúc'
                            />
                        </div>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='discountName'>Tên Giảm Giá</label>
                            <InputText
                                id='discountName'
                                value={searchParams.discountName}
                                onChange={(e) => setSearchParams({ ...searchParams, discountName: e.target.value })}
                                placeholder='Nhập tên giảm giá'
                            />
                        </div>
                        <div className='field col-12'>
                            <label htmlFor='discountPercentage'>
                                Discount Percentage ({searchParams.discountPercentage[0]}% -{' '}
                                {searchParams.discountPercentage[1]}%)
                            </label>
                            <Slider
                                id='discountPercentage'
                                value={searchParams.discountPercentage}
                                onChange={(e: SliderChangeEvent) =>
                                    setSearchParams({ ...searchParams, discountPercentage: e.value })
                                }
                                range
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className='col-12 text-right'>
                            <Button label='Tìm Kiếm' icon='pi pi-search' onClick={handleSearch} className='mt-3' />
                        </div>
                    </div>
                </Card>

                {leftToolbarTemplate()}

                <DataTable
                    value={filteredDiscounts}
                    paginator
                    rows={6}
                    rowsPerPageOptions={[10, 25, 50]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    dataKey='id'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} giảm giá'
                    emptyMessage='Không tim thấy giảm giá nào'
                >
                    <Column header='#' body={indexBodyTemplate} />
                    <Column field='name' header='Tên Giảm Giá' sortable />
                    <Column header='Giá Trị Giảm Giá ' body={formatDiscountAndStock} />
                    <Column
                        field='startDateUtc'
                        header='Ngày Bắt Đầu'
                        body={(rowData) => vietnamTime(rowData.startDateUtc)}
                        sortable
                    />
                    <Column
                        field='endDateUtc'
                        header='Ngày Kết Thúc'
                        body={(rowData) => vietnamTime(rowData.endDateUtc)}
                        sortable
                    />
                    <Column
                        field='status'
                        header='Trạng Thái'
                        body={statusBodyTemplate}
                        sortable
                        filter
                        showClearButton={false}
                        showAddButton={false}
                        filterElement={statusFilterTemplate}
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ width: '15%' }}
                    ></Column>
                    <Column body={editAndExpiredButtonTemplate} header='Thao Tác' />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
