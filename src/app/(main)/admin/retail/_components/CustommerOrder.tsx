import { Button } from 'primereact/button'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { useEffect, useRef, useState } from 'react'
import { FaIdCard, FaUserPlus } from 'react-icons/fa'
import AddressComponent from '@/components/address/AddressComponent'
import provinceService from '@/service/province.service'
import { Address, AddressesResponse, Province } from '@/interface/address.interface'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { IoLocationSharp } from 'react-icons/io5'
import PaymentDialog from './PaymentDialog'
import { Tooltip } from 'primereact/tooltip'
import CustomerDialog from './CustomerDialog'
import { Customer } from '@/interface/customer.interface'
import addressService from '@/service/address.service'
import CustomerAddressDialog from './CustomerAddressDialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Toast } from 'primereact/toast'
import CartService from '@/service/cart.service'
import { OrderRequest, PaymentMethodType, PaymentModeType, PaymentStatusType } from '@/interface/order.interface'
import { CartResponse } from '@/interface/cart.interface'
import OrderService from '@/service/order.service'
import { Voucher } from '@/interface/voucher.interface'
import axios from 'axios'
import { AutoComplete } from 'primereact/autocomplete'
import VoucherSidebar from './VoucherSidebar'
import dayjs from 'dayjs'
import { AxiosError } from 'axios'
import voucherService from '@/service/voucher.service'

interface CustommerOrderProps {
    orderTotals: {
        subtotal: number
        shippingCost: number
        tax: number
        total: number
        discount: number
    }
    totalWeight: number
    fetchBill: () => void
    numberBill: number
    billId: string
}
interface CustomIsApplicable {
    isApplicable: boolean
    couponCode: string
}

interface VoucherErrorResponse {
    reason?: string
    couponCode: string
}

export default function CustommerOrder({ orderTotals, fetchBill, numberBill, billId }: CustommerOrderProps) {
    const [checked, setChecked] = useState<boolean>(false)
    const [provinces, setProvinces] = useState<Province[]>([])
    const [visible, setVisible] = useState<boolean>(false)
    const [amountPaid, setAmountPaid] = useState<number>(0)
    const [customerDialogVisible, setCustomerDialogVisible] = useState<boolean>(false)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [visibleRight, setVisibleRight] = useState<boolean>(false)
    const [, setAmountPaidLocal] = useLocalStorage<number>(0, 'amountPaid')
    const [address, setAddress] = useState<AddressesResponse>({
        addressDetail: '',
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phoneNumber: ''
    })
    const [addressDetail, setAddressDetail] = useState<Address | null>(null)
    const [customerAddressDialogVisible, setCustomerAddressDialogVisible] = useState<boolean>(false)
    const [addresses, setAddresses] = useState<AddressesResponse[]>([])
    const [selectedAddress, setSelectedAddress] = useState<AddressesResponse | null>(null)
    const toast = useRef<Toast>(null)
    const [couponCode, setCouponCode] = useState('')
    const [couponCodes, setCouponCodes] = useState<string[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [validVouchers, setValidVouchers] = useState([])
    const [totalDiscount, setTotalDiscount] = useState<number>(0)
    const [hoveredVoucher, setHoveredVoucher] = useState<Voucher | null>(null)
    const [, setVouchers] = useState<Voucher[]>([])
    const [paymentMethodMode, setPaymentMethodMode] = useState<PaymentMethodType>(PaymentMethodType.Cash)

    const handleHoverEnter = (voucher: Voucher) => {
        setHoveredVoucher(voucher)
    }
    const handleHoverLeave = () => {
        setHoveredVoucher(null)
    }
    const handleClearCouponCodes = () => {
        setCouponCodes([])
        setValidVouchers([])
        setTotalDiscount(0)
    }

    const validateCouponCode = async (couponCodes: string[]) => {
        setLoading(true)
        setMessage('')
        try {
            if (!customer?.email && customer?.id) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Bạn không thể áp dụng nhiều hơn một phiếu giảm giá nếu không chọn một khách hàng.'
                })
                return
            }

            const response = await axios.post('http://localhost:8080/api/admin/vouchers/validate-coupons', {
                subTotal: orderTotals.subtotal,
                email: customer?.email,
                couponCodes: couponCodes
            })
            const { totalDiscount, voucherResponses } = response.data
            setTotalDiscount(totalDiscount || 0)
            const validVoucherList = voucherResponses.filter((voucher: CustomIsApplicable) => voucher.isApplicable)
            setValidVouchers(validVoucherList)
            setAmountPaidLocal(
                orderTotals.subtotal + (checked ? orderTotals.shippingCost : 0) + orderTotals.tax - totalDiscount
            )

            if (validVoucherList.length === 0 && couponCodes.length > 0 && customer) {
                setMessage('Không tìm thấy phiếu giảm giá hợp lệ.')
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response && error.response.data && error.response.data.message) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Voucher Error',
                    detail: error.response.data.message
                })
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error validating coupon. Please try again later.'
                })
            }
        } finally {
            setLoading(false)
        }
    }
    const formatDate = (dateString: string | undefined): string => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    }

    const handleApplyVoucher = () => {
        if (!customer) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Vui lòng chọn một khách hàng trước khi thêm phiếu giảm giá.'
            })
            return
        }
        if (validVouchers.length > 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Bạn không thể áp dụng nhiều hơn một phiếu giảm giá nếu không chọn một khách hàng.'
            })
            return
        }
    }

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        await fetchVouchers()

        if (event.key === 'Enter' && couponCode.trim() !== '') {
            const voucherCodeUpperCase = couponCode.trim().toUpperCase()

            const response = await axios.post('http://localhost:8080/api/admin/vouchers/validate-coupons', {
                subTotal: orderTotals.subtotal,
                email: customer?.email,
                couponCodes: [voucherCodeUpperCase]
            })
            const { voucherResponses } = response.data

            const isVoucherAlreadyAdded = couponCodes.includes(voucherCodeUpperCase)

            const isVoucherInResponses = voucherResponses.some(
                (responseVoucher: CustomIsApplicable) =>
                    responseVoucher.couponCode.toUpperCase() === voucherCodeUpperCase && responseVoucher.isApplicable
            )

            if (!isVoucherAlreadyAdded && isVoucherInResponses) {
                setCouponCodes((prevCoupons) => [...prevCoupons, voucherCodeUpperCase])
                setCouponCode('')
            } else if (isVoucherAlreadyAdded) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Mã voucher đã được thêm trước đó'
                })
            } else if (!isVoucherInResponses) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: voucherResponses
                        .map(
                            (voucher: VoucherErrorResponse) =>
                                voucher.reason || `Voucher ${voucher.couponCode} không hợp lệ.`
                        )
                        .join(', ')
                })
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Mã voucher không hợp lệ'
                })
            }
        }
    }

    const handleRemoveValidVoucher = (voucher: Voucher) => {
        setValidVouchers((prevVouchers) => {
            const updatedVouchers = prevVouchers.filter((v) => v.couponCode !== voucher.couponCode)
            return updatedVouchers
        })

        setCouponCodes((prevCoupons) => {
            const updatedCoupons = prevCoupons.filter((code) => code !== voucher.couponCode)
            validateCouponCode(updatedCoupons)
            return updatedCoupons
        })
    }

    const handleRemoveCouponCode = (index: number) => {
        setCouponCodes((prevCoupons) => prevCoupons.filter((_, i) => i !== index))
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value.toUpperCase()
        if (value.length > 18) {
            value = value.slice(0, 18)
        }
        setCouponCode(value)
    }

    const fetchProvinces = async () => {
        const { payload: provinces } = await provinceService.getAll()
        setProvinces(provinces)
    }

    useMountEffect(() => {
        fetchProvinces()
    })

    const handleGetAddress = async (addressRequest: Address) => {
        setAddressDetail(addressRequest)
    }

    const handlePayment = () => {
        if (!validateAddress()) return
        if (!validateDiscount()) return
        setVisible(true)
    }

    const validateAddress = () => {
        if (checked) {
            if (
                (address && !address.firstName) ||
                (address && !address.lastName) ||
                (address && !address.phoneNumber)
            ) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng nhập đầy đủ thông tin '
                })
                return false
            }
        }
        return true
    }

    const validateDiscount = () => {
        if (validVouchers.length > 0 && !customer) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Bạn không thể áp dụng nhiều hơn một phiếu giảm giá nếu không chọn một khách hàng.'
            })
            return
        }
        return true
    }

    const validatePayment = () => {
        const totalOrder = Number(
            orderTotals.subtotal + (checked ? orderTotals.shippingCost : 0) + orderTotals.tax - totalDiscount
        )
        const amountPaidNumber = Number(amountPaid)
        if (amountPaidNumber < totalOrder && !checked) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Vui lòng nhập số tiền chính xác'
            })
            return false
        }
        return true
    }

    useUpdateEffect(() => {
        fetchAddress()
    }, [customer])

    const fetchAddress = async () => {
        if (!customer?.id) return
        const { payload: items } = await addressService.getAll(customer.id)
        setAddress(items.items[0])
        if (items.items[0]?.id) {
            getAddress(items.items[0].id)
        }
    }

    const getAddress = async (id: number) => {
        const { payload } = await addressService.getById(id)
        const fullAddress: Address = {
            provinceId: payload.provinceId,
            districtId: payload.districtId,
            wardId: payload.wardId,
            address: payload.addressName
        }
        setAddress((prev) => ({
            ...prev,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phoneNumber: payload.phoneNumber
        }))
        setAddressDetail(fullAddress)
    }

    const fetchAddressesCustomer = async () => {
        if (!customer?.id) return
        const { payload: data } = await addressService.getAll(customer.id)
        const uniqueAddresses = data.items.filter(
            (value, index, self) =>
                index ===
                self.findIndex(
                    (t) =>
                        t.addressDetail === value.addressDetail &&
                        t.phoneNumber === value.phoneNumber &&
                        t.firstName === value.firstName &&
                        t.lastName === value.lastName
                )
        )
        setAddresses(uniqueAddresses)
    }

    const onOpenCustomerAddressDialog = () => {
        fetchAddressesCustomer()
        setCustomerAddressDialogVisible(true)
    }
    const handleSelectAddress = (address: AddressesResponse) => {
        setSelectedAddress(address)
        setCustomerAddressDialogVisible(false)
        if (address.id) {
            getAddress(address.id)
        }
    }

    const handleOrder = async () => {
        if (validVouchers.length > 0) validateCouponCode(couponCodes)
        if (!validateAddress()) return
        if (!validateDiscount()) return
        if (!validatePayment()) return
        if (
            amountPaid <
                orderTotals.subtotal + (checked ? orderTotals.shippingCost : 0) + orderTotals.tax - totalDiscount &&
            !checked
        ) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng thanh toán đủ số tiền'
            })
            return
        }
        const validVoucherIds = validVouchers
            .map((voucher: Voucher) => voucher.id)
            .filter((id): id is number => id !== undefined)

        confirmDialog({
            message:
                amountPaid == 0
                    ? 'Thanh toán khi nhận hàng, xác nhận để tiếp tục'
                    : 'Bạn có chắc muốn tiếp tục đơn hàng này không?',
            header: 'Xác Nhận Đơn Hàng',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            accept: () => {
                CartService.getCart(billId).then(async (res: CartResponse[]) => {
                    const totalOrder = orderTotals.total - totalDiscount + (checked ? orderTotals.shippingCost : 0)
                    const order: OrderRequest = {
                        customerId: customer?.id || 1,
                        orderGuid: billId,
                        addressType: checked ? 2 : -1,
                        orderId: '',
                        pickupInStore: false,
                        orderStatusId: checked ? 1 : 7,
                        paymentStatusId: PaymentStatusType.Paid,
                        paymentMethodId: paymentMethodMode,
                        paymentMode: PaymentModeType.IN_STORE,
                        orderSubtotal: orderTotals.subtotal,
                        orderSubtotalDiscount: 0,
                        orderShipping: checked ? orderTotals.shippingCost : 0,
                        orderDiscount: totalDiscount,
                        orderTotal: totalOrder,
                        refundedAmount: 0,
                        paidDateUtc: '',
                        billCode: 'HĐ' + numberBill,
                        deliveryMode: checked ? 0 : 1,
                        orderItems: res.map((item) => ({
                            productId: item.productResponse.id,
                            orderItemGuid: '',
                            quantity: item.quantity,
                            unitPrice: item.productResponse.price,
                            priceTotal: item.quantity * item.productResponse.price,
                            discountAmount: 0,
                            originalProductCost: item.productResponse.price,
                            attributeDescription: '',
                            discountPrice: item.productResponse.discountPrice * item.quantity || null
                        })),
                        addressRequest: checked
                            ? {
                                  customerId: customer?.id || 1,
                                  firstName: address.firstName,
                                  lastName: address.lastName,
                                  email: address.email,
                                  addressName: addressDetail?.address || '',
                                  provinceId: addressDetail?.provinceId || '',
                                  districtId: addressDetail?.districtId || '',
                                  wardId: addressDetail?.wardId || '',
                                  phoneNumber: address.phoneNumber
                              }
                            : null,
                        idVouchers: validVoucherIds
                    }

                    const subtotalCheck = res.reduce((total, cartItem) => {
                        const price = cartItem.productResponse.discountPrice || cartItem.productResponse.price
                        return total + price * cartItem.quantity
                    }, 0)
                    if (orderTotals.subtotal != subtotalCheck) {
                        confirmDialog({
                            message: 'Đơn hàng không hợp lệ vui lòng kiểm tra lại',
                            header: 'Xác Nhận',
                            icon: 'pi pi-exclamation-triangle',
                            defaultFocus: 'accept',
                            accept: () => {
                                window.location.reload()
                            }
                        })
                        return
                    }
                    if (order.addressRequest && checked) {
                        if (
                            order.addressRequest.provinceId === '' ||
                            order.addressRequest.districtId === '' ||
                            order.addressRequest.wardId === '' ||
                            order.addressRequest.addressName === ''
                        ) {
                            toast.current?.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Vui lòng chọn nhập địa chỉ'
                            })
                            return
                        }
                    }
                    OrderService.createOrder(order)
                        .then(async (res) => {
                            if (res.status === 200) {
                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: 'Đơn hàng đã được tạo thành công'
                                })
                                await new Promise((resolve) => setTimeout(resolve, 1000))

                                localStorage.removeItem('billIdCurrent')
                                setCustomer(null)
                                await CartService.deleteBill(billId)
                                await fetchBill()
                            }
                        })
                        .catch((error) => {
                            toast.current?.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: error instanceof Error ? error.message : 'Đã xảy ra lỗi'
                            })
                        })
                })
            }
        })
    }

    const onCheckRetail = () => {
        if (customer) {
            confirmDialog({
                message: 'Bạn có chắc muốn bán lẻ không?',
                header: 'Xác Nhận',
                icon: 'pi pi-exclamation-triangle',
                defaultFocus: 'accept',
                accept: () => {
                    setCustomer(null)
                    setAddress({
                        firstName: '',
                        lastName: '',
                        phoneNumber: '',
                        note: '',
                        email: '',
                        company: '',
                        addressDetail: ''
                    })
                    setAddressDetail(null)
                    setChecked(false)
                }
            })
        }
    }

    useEffect(() => {
        if (couponCodes.length > 0 && customer) validateCouponCode(couponCodes)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderTotals.subtotal])

    useEffect(() => {
        if (amountPaid > 0)
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Đã lưu thanh toán thành công',
                life: 3000
            })
    }, [amountPaid])
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    const fetchVouchers = async () => {
        const vouchersData = await voucherService.getAllIsPublished()
        const filteredVouchers = vouchersData.filter((voucher: Voucher) => voucher.usageCount > 0)
        setVouchers(filteredVouchers)
    }

    const isCheckedAndCustomerExists = () => {
        return customer != null && checked
    }

    const handleInputSwitchChange = (e: InputSwitchChangeEvent) => {
        if (!customer && e.value) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Vui lòng chọn khách hàng'
            })
            return
        }
        setChecked(e.value)
    }

    return (
        <div className='space-y-4 w-full'>
            <div className='card'>
                <div className='flex justify-between border py-2 px-4 mb-4 mt-1 rounded-2xl shadow-md'>
                    <div className='flex items-center justify-between gap-4 py-3 border px-4 rounded-lg my-2 shadow-inner'>
                        <label className='text-base font-normal text-gray-500 dark:text-gray-400'>Bán Lẻ</label>
                        <InputSwitch checked={!customer ? true : false} onChange={() => onCheckRetail()} />
                    </div>
                    <div className='flex items-center gap-2'>
                        <Tooltip target='.customer-tooltip' mouseTrack mouseTrackLeft={10} />
                        <FaUserPlus
                            onClick={() => setCustomerDialogVisible(true)}
                            data-pr-tooltip='Chọn Khách Hàng'
                            className='text-primary-700 text-5xl cursor-pointer customer-tooltip '
                        />
                        {customer != null && checked && (
                            <>
                                <Tooltip target='.location-tooltip' mouseTrack mouseTrackLeft={10} />

                                <IoLocationSharp
                                    onClick={onOpenCustomerAddressDialog}
                                    data-pr-tooltip='Pick Location'
                                    className='text-primary-700 text-5xl cursor-pointer location-tooltip'
                                />
                            </>
                        )}
                    </div>
                    <div className='flex items-center justify-between gap-4 py-3 border px-4 rounded-lg my-2 shadow-inner'>
                        <label className='text-base font-normal text-gray-500 dark:text-gray-400'>Vận Chuyển</label>
                        <InputSwitch checked={isCheckedAndCustomerExists()} onChange={handleInputSwitchChange} />
                    </div>
                </div>
                <ConfirmDialog />
                <div className='flex justify-between gap-x-8 '>
                    {customer && (
                        <>
                            <div className='w-[45%]'>
                                <h3 className='text-2xl font-bold'>Thông Tin Khách Hàng</h3>
                                <div className='flex flex-col md:flex-row justify-between gap-4 w-full'>
                                    <div className='field w-full md:w-1/2'>
                                        <label htmlFor='firstName' className='font-medium block'>
                                            Tên
                                        </label>
                                        <InputText
                                            onChange={(e) =>
                                                setAddress(
                                                    (prev) =>
                                                        prev && {
                                                            ...prev,
                                                            firstName: e.target.value
                                                        }
                                                )
                                            }
                                            value={address?.firstName || ''}
                                            id='firstName'
                                            className='w-full'
                                            disabled={!checked}
                                        />
                                    </div>
                                    <div className='field w-full md:w-1/2'>
                                        <label htmlFor='lastName' className='font-medium block'>
                                            Họ
                                        </label>
                                        <InputText
                                            onChange={(e) =>
                                                setAddress(
                                                    (prev) =>
                                                        prev && {
                                                            ...prev,
                                                            lastName: e.target.value
                                                        }
                                                )
                                            }
                                            value={address?.lastName || ''}
                                            id='lastName'
                                            className='w-full'
                                            disabled={!checked}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-wrap justify-content-between w-full'>
                                    <div className='field w-full md:w-[49%]'>
                                        <label htmlFor='phoneNumber' className='font-medium block'>
                                            Số Điện Thoại
                                        </label>
                                        <InputText
                                            onChange={(e) =>
                                                setAddress(
                                                    (prev) =>
                                                        prev && {
                                                            ...prev,
                                                            phoneNumber: e.target.value
                                                        }
                                                )
                                            }
                                            value={address?.phoneNumber || ''}
                                            id='phoneNumber'
                                            className='w-full'
                                            disabled={!checked}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-wrap justify-content-between w-full gap-2'>
                                    {checked && (
                                        <AddressComponent
                                            provinces={provinces || []}
                                            submitted={false}
                                            onAddressChange={handleGetAddress}
                                            addressDetail={addressDetail || undefined}
                                        />
                                    )}
                                </div>
                                {checked && (
                                    <div className='field w-full'>
                                        <label htmlFor='addressName' className='font-medium block'>
                                            Địa Chỉ Chi Tiết
                                        </label>
                                        <InputText
                                            onChange={(e) =>
                                                setAddressDetail((prev) =>
                                                    prev ? { ...prev, address: e.target.value } : null
                                                )
                                            }
                                            value={addressDetail?.address || ''}
                                            id='addressName'
                                            className='w-full'
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <div className='w-full'>
                        <h3 className='text-2xl font-bold'>Thông Tin Đơn Hàng</h3>
                        <div className='divide-y divide-gray-200 dark:divide-gray-800'>
                            {customer && (
                                <>
                                    <div className='flex justify-between gap-3 py-3'>
                                        <div className='flex items-center justify-center gap-3'>
                                            <label className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                                Phiếu Giảm Giá
                                            </label>
                                            <AutoComplete
                                                id='couponCode'
                                                size={12}
                                                value={couponCode}
                                                onInput={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder='Nhập mã giảm giá'
                                            />
                                            <Button
                                                icon='pi pi-thumbtack'
                                                onClick={() => validateCouponCode(couponCodes)}
                                                loading={loading}
                                                disabled={loading || couponCodes.length === 0}
                                            />
                                        </div>
                                        <Button onClick={() => setVisibleRight(true)} icon='pi pi-ticket' />
                                    </div>
                                </>
                            )}
                            <VoucherSidebar
                                visibleRight={visibleRight}
                                setVisibleRight={setVisibleRight}
                                customer={customer}
                                handleApplyVoucher={handleApplyVoucher}
                            />
                            {validVouchers.length > 0 || couponCodes.length > 0 || message ? (
                                <dl className='bg-white p-4 my-2 rounded-md shadow-sm max-w mx-auto mt-3 border border-gray-200'>
                                    {message && (
                                        <div className='mt-2 text-xs text-red-600 font-medium border-l-4 border-red-600 pl-2 py-1 bg-red-50 rounded-sm'>
                                            {message}
                                        </div>
                                    )}
                                    {validVouchers.length > 0 && (
                                        <div className='mt-2'>
                                            <h3 className='text-sm font-semibold text-green-700 mb-3'>
                                                Mã Voucher Hợp Lệ:
                                            </h3>
                                            <ul className='grid grid-cols-2 gap-3 max-h-40 border border-green-200 rounded-md p-3'>
                                                {validVouchers.map((voucher: Voucher, index) => (
                                                    <li
                                                        key={index}
                                                        className='flex items-center justify-between px-3 py-2 rounded-md border border-green-500 bg-green-50 hover:bg-green-100 transition-colors text-xs relative'
                                                        onMouseEnter={() => handleHoverEnter(voucher)}
                                                        onMouseLeave={handleHoverLeave}
                                                    >
                                                        <span className='font-semibold text-green-700'>
                                                            {voucher.couponCode}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveValidVoucher(voucher)}
                                                            className='text-red-500 hover:text-red-700 ml-2'
                                                        >
                                                            ×
                                                        </button>

                                                        {hoveredVoucher?.id === voucher.id && (
                                                            <div className='absolute bg-white shadow-lg p-4 rounded-lg w-64 border border-gray-300 mt-60 z-20'>
                                                                <h4 className='font-semibold text-sm text-green-700'>
                                                                    Voucher Conditions
                                                                </h4>
                                                                <div className='text-xs text-gray-600 mt-2 space-y-2'>
                                                                    {(voucher.discountPercent ||
                                                                        voucher.discountAmount) && (
                                                                        <p>
                                                                            Discount:{' '}
                                                                            {voucher.discountPercent
                                                                                ? `${voucher.discountPercent}%`
                                                                                : `$${voucher.discountAmount}`}
                                                                        </p>
                                                                    )}
                                                                    {voucher.minOderAmount && (
                                                                        <p>
                                                                            Min Order Amount:{' '}
                                                                            {formatCurrency(voucher.minOderAmount)}
                                                                        </p>
                                                                    )}
                                                                    {voucher.maxDiscountAmount && (
                                                                        <p>
                                                                            Max Discount:{' '}
                                                                            {formatCurrency(voucher.maxDiscountAmount)}
                                                                        </p>
                                                                    )}
                                                                    <p>
                                                                        Validity: {formatDate(voucher.startDateUtc)} -{' '}
                                                                        {formatDate(voucher.endDateUtc)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {couponCodes.length > 0 && (
                                        <div className='mt-4'>
                                            <h3 className='text-sm font-semibold text-blue-700 mb-3'>
                                                Mã giảm giá đã nhập:
                                            </h3>
                                            <ul className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2'>
                                                {couponCodes.map((code, index) => (
                                                    <li
                                                        key={index}
                                                        className='flex items-center justify-between px-2 py-1 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-xs'
                                                    >
                                                        <span className='font-medium text-gray-700'>{code}</span>
                                                        <button
                                                            onClick={() => handleRemoveCouponCode(index)}
                                                            className='text-red-500 hover:text-red-700 ml-1'
                                                        >
                                                            ×
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className='mt-2'>
                                                <button
                                                    onClick={handleClearCouponCodes}
                                                    className='px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors text-sm'
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {validVouchers.length === 0 && couponCodes.length === 0 && (
                                        <div className='mt-3 text-xs text-gray-500 text-center font-medium'>
                                            Không áp dụng giảm giá.
                                        </div>
                                    )}
                                </dl>
                            ) : null}
                            <dl className='flex items-center justify-between gap-4 py-3'>
                                <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Tổng phụ</dt>
                                <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                    {formatCurrency(orderTotals.subtotal)}
                                </dd>
                            </dl>
                            {checked && (
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                        Chi phí vận chuyển
                                    </dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        {formatCurrency(orderTotals.shippingCost)}
                                    </dd>
                                </dl>
                            )}
                            <dl className='flex items-center justify-between gap-4 py-3'>
                                <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Giảm giá</dt>
                                <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                    {formatCurrency(totalDiscount)}
                                </dd>
                            </dl>
                            <dl className='flex items-center justify-between gap-4 py-3'>
                                <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Tổng cộng</dt>
                                <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                    {formatCurrency(
                                        Math.max(
                                            orderTotals.subtotal +
                                                (checked ? orderTotals.shippingCost : 0) +
                                                orderTotals.tax -
                                                totalDiscount,
                                            0
                                        )
                                    )}
                                </dd>
                            </dl>
                            <dl className='flex items-center justify-between gap-4 py-3'>
                                <dt className='text-base font-normal flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                                    Thanh toán của khách hàng
                                    <FaIdCard
                                        className='text-primary-700 text-5xl cursor-pointer'
                                        onClick={handlePayment}
                                    />
                                </dt>
                                <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                    {formatCurrency(amountPaid)}
                                </dd>
                            </dl>
                        </div>
                        <div className='space-y-3'>
                            <button
                                type='submit'
                                className='flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800'
                                onClick={handleOrder}
                            >
                                Tiến hành thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <PaymentDialog
                visible={visible}
                setVisible={setVisible}
                totalAmount={
                    orderTotals.subtotal + (checked ? orderTotals.shippingCost : 0) + orderTotals.tax - totalDiscount
                }
                setAmountPaid={setAmountPaid}
                amountPaid={amountPaid}
                setPaymentMethodMode={setPaymentMethodMode}
            />
            <CustomerDialog
                setCustomer={setCustomer}
                visible={customerDialogVisible}
                setVisible={setCustomerDialogVisible}
            />
            <Toast ref={toast} />
            <CustomerAddressDialog
                visible={customerAddressDialogVisible}
                setVisible={setCustomerAddressDialogVisible}
                addresses={addresses}
                setSelectedAddress={setSelectedAddress}
                selectedAddress={selectedAddress}
                onSelectAddress={handleSelectAddress}
            />
        </div>
    )
}
