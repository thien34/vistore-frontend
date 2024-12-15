'use client'

import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { useRef, useState, useEffect } from 'react'
import { Column } from 'primereact/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import voucherService from '@/service/voucher.service'
import { Voucher } from '@/interface/voucher.interface'
import Link from 'next/link'
import { classNames } from 'primereact/utils'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import Spinner from '@/components/spinner/Spinner'
import discountService from '@/service/discount.service'
import { Image } from 'primereact/image'
import axios from 'axios'

dayjs.extend(utc)
dayjs.extend(timezone)

const vietnamTime = (date: string) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')

const ListView = () => {
    const [discounts, setDiscounts] = useState<Voucher[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<Voucher[]>([])
    const toast = useRef<Toast>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                setLoading(true)
                const response = await voucherService.getAll()
                setDiscounts(response)
                setFilteredDiscounts(response)
            } catch (error) {
                console.error('Lỗi khi lấy thông tin giảm giá:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDiscounts()
    }, [])

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Link href='/admin/vouchers/add'>
                <Button label='Thêm voucher mới' icon='pi pi-plus' severity='success' />
            </Link>
            <Link href='/admin/vouchers/default-birthday-voucher'>
                <Button label='Cập nhật voucher sinh nhật mặc định' icon='pi pi-plus' severity='info' />
            </Link>
        </div>
    )

    const statusBodyTemplate = (discount: Voucher) => {
        const { severity, icon } = getStatus(discount.status)
        return <Tag value={discount.status} severity={severity} icon={icon} />
    }

    const formatDiscountAndStock = (rowData: Voucher) => {
        const isPercentage = rowData.usePercentage
        const stockClassName = classNames(
            'w-4rem h-4rem inline-flex font-bold justify-content-center align-items-center text-sm',
            {
                'text-green-900': isPercentage && rowData.discountPercentage >= 1 && rowData.discountPercentage < 10,
                ' text-yellow-900': isPercentage && rowData.discountPercentage >= 10 && rowData.discountPercentage < 20,
                ' text-orange-900': isPercentage && rowData.discountPercentage >= 20 && rowData.discountPercentage < 30,
                ' text-teal-900': isPercentage && rowData.discountPercentage >= 30 && rowData.discountPercentage < 40,
                ' text-blue-900': isPercentage && rowData.discountPercentage >= 40 && rowData.discountPercentage < 50,
                ' text-red-900': isPercentage && rowData.discountPercentage >= 50,

                ' text-green-500': !isPercentage && rowData.discountAmount >= 1 && rowData.discountAmount < 10,
                ' text-yellow-500': !isPercentage && rowData.discountAmount >= 10 && rowData.discountAmount < 20,
                ' text-orange-500': !isPercentage && rowData.discountAmount >= 20 && rowData.discountAmount < 30,
                ' text-teal-500': !isPercentage && rowData.discountAmount >= 30 && rowData.discountAmount < 40,
                ' text-blue-500': !isPercentage && rowData.discountAmount >= 40 && rowData.discountAmount < 50,
                ' text-red-500': !isPercentage && rowData.discountAmount >= 50
            }
        )

        return (
            <div className={stockClassName}>
                {isPercentage ? `${rowData.discountPercentage} %` : formatCurrency(rowData.discountAmount)}
            </div>
        )
    }

    const getStatus = (
        status: string
    ): { severity: 'success' | 'info' | 'danger' | 'warning' | null; icon: string | null } => {
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
    const typeBodyTemplate = (rowData: Voucher) => {
        if (rowData.isPublished) {
            return <Tag value='Công khai' icon='pi pi-unlock' severity='info' />
        } else {
            return <Tag value='Riêng tư' icon='pi pi-lock' severity='warning' />
        }
    }

    const voucherInfoTemplate = (rowData: Voucher) => {
        const imageUrl = rowData.usePercentage
            ? 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/percent-colorful.0e15568.png'
            : 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/dollar-colorful.5e618d0.png'

        return (
            <div className='flex items-center gap-2'>
                <Image src={imageUrl} alt='Loại giảm giá' className='w-4rem h-4rem' style={{ borderRadius: '50%' }} />
                <div>
                    <div>{rowData.name}</div>
                    <div style={{ fontSize: '0.85em', color: '#888' }}>
                        {rowData.couponCode ? `Mã giảm giá: ${rowData.couponCode}` : 'Áp dụng'}
                    </div>
                </div>
            </div>
        )
    }

    const editAndExpiredButtonTemplate = (rowData: Voucher) => {
        return (
            <div className='flex gap-2'>
                {rowData.status !== 'CANCEL' && (
                    <Link href={`/admin/vouchers/${rowData.id}`}>
                        <Button icon='pi pi-pencil' severity='info' aria-label='Cập nhật' rounded />
                    </Link>
                )}
                {rowData.status === 'ACTIVE' && (
                    <Button
                        icon='pi pi-times'
                        severity='danger'
                        aria-label='Hết hạn'
                        onClick={() => openConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
                {rowData.status === 'UPCOMING' && (
                    <Button
                        icon='pi pi-trash'
                        severity='warning'
                        aria-label='Thông báo'
                        onClick={() => openCancelConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
            </div>
        )
    }

    const handleCancelDiscount = async (promotionId: number | undefined) => {
        try {
            await discountService.cancelDiscount(promotionId)

            const updatedDiscounts = discounts.map((discount) =>
                discount.id === promotionId ? { ...discount, status: 'CANCEL' } : discount
            )
            setDiscounts(updatedDiscounts)
            setFilteredDiscounts(updatedDiscounts)

            toast.current?.show({
                severity: 'success',
                summary: 'Cập nhật trạng thái',
                detail: 'Khuyến mãi được đánh dấu là bị hủy thành công!',
                life: 3000
            })
        } catch (error: unknown) {
            console.error('Lỗi hủy khuyến mãi: ', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Lỗi hủy khuyến mại',
                life: 3000
            })
        }
    }

    const openCancelConfirmDialog = (promotionId: number | undefined) => {
        confirmDialog({
            message: 'Bạn có chắc là bạn muốn hủy chương trình khuyến mãi này không?',
            header: 'Xác nhận hủy',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => handleCancelDiscount(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Hủy bỏ',
                    detail: 'Hành động bị hủy bỏ.',
                    life: 3000
                })
            }
        })
    }

    const handleConfirmExpired = async (promotionId: number | undefined) => {
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
                summary: 'Cập nhật trạng thái',
                detail: 'Khuyến mãi đã được đánh dấu là hết hạn và ngày kết thúc được đặt là thời điểm hiện tại.!',
                life: 3000
            })
        } catch (error: unknown) {
            console.error('Khuyến mãi đã được đánh dấu là hết hạn:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể cập nhật trạng thái hết hạn của khuyến mãi.',
                life: 3000
            })
        }
    }

    const openConfirmDialog = (promotionId: number | undefined) => {
        confirmDialog({
            message: 'Bạn có chắc là bạn muốn đánh dấu chương trình khuyến mãi này là đã hết hạn?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => handleConfirmExpired(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Hủy bỏ',
                    detail: 'Hành động bị hủy bỏ.',
                    life: 3000
                })
            }
        })
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }
    async function handleGenerateBirthdayVouchers() {
        try {
            debugger
            await axios.post('http://localhost:8080/api/admin/vouchers/generate-birthday-vouchers')
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Voucher sinh nhật được tạo thành công',
                life: 3000
            })
        } catch (error) {
            console.error('Không thể tạo voucher sinh nhật:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tạo voucher sinh nhật',
                life: 3000
            })
        }
    }
    const indexBodyTemplate = (_: Voucher, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }
    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Spinner isLoading={loading} />
            <div className='card'>
                {leftToolbarTemplate()}
                <Button className='my-4' icon='pi pi-plus' label='Tạo voucher sinh nhật' onClick={handleGenerateBirthdayVouchers}></Button>
                <DataTable
                    scrollable
                    value={filteredDiscounts}
                    paginator
                    rows={6}
                    rowsPerPageOptions={[10, 25, 50]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    dataKey='id'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} voucher'
                    emptyMessage='Không tìm thấy giảm giá.'
                >
                    <Column header='#' body={indexBodyTemplate} />
                    <Column header='Tên phiếu giảm giá' frozen body={voucherInfoTemplate} />
                    <Column header='Trạng thái' body={statusBodyTemplate} />
                    <Column header='Giá trị giảm' body={formatDiscountAndStock} />
                    <Column header='Loại voucher' body={typeBodyTemplate} />
                    <Column
                        header='Khả dụng'
                        body={(rowData) => {
                            const total = rowData.limitationTimes || '∞'
                            const used = rowData.usageCount || 0
                            return `${used}/${total}`
                        }}
                    />
                    <Column
                        header='Thời gian áp dụng'
                        body={(rowData) => {
                            const startTime = vietnamTime(rowData.startDateUtc)
                            const endTime = vietnamTime(rowData.endDateUtc)
                            return `${startTime} - ${endTime}`
                        }}
                    />
                    <Column header='Thao Tác' body={editAndExpiredButtonTemplate} />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
