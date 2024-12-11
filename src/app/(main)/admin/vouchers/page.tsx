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
                console.error('Error fetching discounts:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDiscounts()
    }, [])

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Link href='/admin/vouchers/add'>
                <Button label='Add new discount' icon='pi pi-plus' severity='success' />
            </Link>
            <Link href='/admin/vouchers/default-birthday-voucher'>
                <Button label='Update default birthday voucher' icon='pi pi-plus' severity='info' />
            </Link>
        </div>
    )

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
                {isPercentage ? `${rowData.discountPercentage.toFixed(0)} %` : `$${rowData.discountAmount.toFixed(2)}`}
            </div>
        )
    }

    const statusBodyTemplate = (discount: Voucher) => {
        const { severity, icon } = getStatus(discount.status)
        return <Tag value={discount.status} severity={severity} icon={icon} />
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
            return <Tag value='Public' icon='pi pi-unlock' severity='info' />
        } else {
            return <Tag value='Private' icon='pi pi-lock' severity='warning' />
        }
    }

    const voucherInfoTemplate = (rowData: Voucher) => {
        const imageUrl = rowData.usePercentage
            ? 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/percent-colorful.0e15568.png'
            : 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/dollar-colorful.5e618d0.png'

        return (
            <div className='flex items-center gap-2'>
                <Image src={imageUrl} alt='Discount Type' className='w-4rem h-4rem' style={{ borderRadius: '50%' }} />
                <div>
                    <div>{rowData.name}</div>
                    <div style={{ fontSize: '0.85em', color: '#888' }}>
                        {rowData.couponCode ? `Voucher code: ${rowData.couponCode}` : 'Applicable'}
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
                summary: 'Status Updated',
                detail: 'Promotion marked as cancelled successfully!',
                life: 3000
            })
        } catch (error: unknown) {
            console.error('Error cancelling promotion:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error cancelling promotion',
                life: 3000
            })
        }
    }

    const openCancelConfirmDialog = (promotionId: number | undefined) => {
        confirmDialog({
            message: 'Are you sure you want to cancel this promotion?',
            header: 'Confirm Cancel',
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
                summary: 'Status Updated',
                detail: 'Promotion marked as expired and end date set to now!',
                life: 3000
            })
        } catch (error: unknown) {
            console.error('Error marking promotion as expired:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error marking promotion as expired',
                life: 3000
            })
        }
    }

    const openConfirmDialog = (promotionId: number | undefined) => {
        confirmDialog({
            message: 'Are you sure you want to mark this promotion as expired?',
            header: 'Confirm',
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
    const isCumulativeTemplate = (rowData: Voucher) => {
        return (
            <Tag
                severity={rowData.isCumulative ? 'success' : 'danger'}
                icon={rowData.isCumulative ? 'pi pi-check' : 'pi pi-times'}
                value={rowData.isCumulative ? 'True' : 'False'}
            />
        )
    }
    async function handleGenerateBirthdayVouchers() {
        try {
            debugger
            await axios.post('http://localhost:8080/api/admin/vouchers/generate-birthday-vouchers')
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Birthday Vouchers generated successfully',
                life: 3000
            })
        } catch (error) {
            console.error('Error generating birthday vouchers:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to generate birthday vouchers',
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
                <Button className='my-4' onClick={handleGenerateBirthdayVouchers}>
                    Generate Birthday Vouchers
                </Button>
                <DataTable
                    scrollable
                    value={filteredDiscounts}
                    paginator
                    rows={6}
                    rowsPerPageOptions={[10, 25, 50]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    dataKey='id'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} entries'
                    emptyMessage='No discounts found.'
                >
                    <Column header='#' body={indexBodyTemplate} />
                    <Column header='Voucher Name | Voucher Code' frozen body={voucherInfoTemplate} />
                    <Column header='Status' body={statusBodyTemplate} />
                    <Column header='Discount Value' body={formatDiscountAndStock} />
                    <Column header='Type' body={typeBodyTemplate} />
                    <Column
                        header='Limitation Times'
                        body={(rowData) => (rowData.limitationTimes ? rowData.limitationTimes : 'Infinite')}
                    />
                    <Column header='Usage Count' field='usageCount' />
                    <Column
                        header='Time of Discount Code'
                        body={(rowData) => {
                            const startTime = vietnamTime(rowData.startDateUtc)
                            const endTime = vietnamTime(rowData.endDateUtc)
                            return `${startTime} - ${endTime}`
                        }}
                    />
                    <Column header='Actions' body={editAndExpiredButtonTemplate} />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
