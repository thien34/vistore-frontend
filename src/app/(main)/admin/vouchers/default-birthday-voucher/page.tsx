'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { Checkbox } from 'primereact/checkbox'
import { Toast } from 'primereact/toast'
import { useRouter } from 'next/navigation'
import voucherService from '@/service/voucher.service'
import { BirthdayVoucherUpdate } from '@/interface/voucher.interface'

const VoucherUpdateDefaultBirthday = () => {
    const [discountName, setDiscountName] = useState('')
    const [usePercentage, setUsePercentage] = useState(true)
    const [value, setValue] = useState(0)
    const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(null)
    const [minOrderAmount, setMinOrderAmount] = useState(1)
    const [isCumulative, setIsCumulative] = useState(false)
    const [limitationTimes, setLimitationTimes] = useState(0)
    const [perCustomerLimit, setPerCustomerLimit] = useState(1)
    const toast = useRef<Toast>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()

    const handleUpdateVoucher = async () => {
        if (!validateForm()) {
            toast.current?.show({
                severity: 'error',
                summary: 'Xác nhận không thành công',
                detail: 'Vui lòng sửa các lỗi được tô đậm trước khi cập nhật.',
                life: 3000
            })
            return
        }

        const updatedVoucher: BirthdayVoucherUpdate = {
            usePercentage,
            discountAmount: usePercentage ? 0 : value,
            discountPercentage: usePercentage ? value : 0,
            maxDiscountAmount,
            isCumulative,
            limitationTimes,
            perCustomerLimit,
            minOrderAmount
        }

        try {
            await voucherService.updateDefaultBirthdayVoucher(updatedVoucher)
            toast.current?.show({
                severity: 'success',
                summary: 'Cập nhật thành công',
                detail: 'Voucher đã được cập nhật thành công.',
                life: 3000
            })
            router.push('/admin/vouchers')
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update voucher. Please try again later.'
            toast.current?.show({
                severity: 'error',
                summary: 'Cập nhật không thành công',
                detail: errorMessage,
                life: 5000
            })
        }
    }

    const fetchDefaultBirthdayVoucher = async () => {
        try {
            const voucherData = await voucherService.getDefaultBirthdayVoucher()
            setDiscountName(voucherData.name)
            setUsePercentage(voucherData.usePercentage)
            setValue(voucherData.usePercentage ? voucherData.discountPercentage : voucherData.discountAmount)
            setMaxDiscountAmount(voucherData.maxDiscountAmount ?? null)
            setMinOrderAmount(voucherData.minOderAmount ?? 1)
            setIsCumulative(voucherData.isCumulative ?? false)
            setLimitationTimes(voucherData.limitationTimes ?? 1)
            setPerCustomerLimit(voucherData.discountLimitationId ?? 1)
        } catch (error) {
            console.error('Lỗi tìm kiếm phiếu mua hàng sinh nhật mặc định:', error)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!discountName.trim()) {
            newErrors.discountName = 'Tên voucher là bắt buộc.'
        }

        if (limitationTimes <= 0) {
            newErrors.limitationTimes = 'Thời gian giới hạn phải lớn hơn 0.'
        }
        if (limitationTimes > 100) {
            newErrors.limitationTimes = 'Thời gian giới hạn không nên vượt quá 100.'
        }

        if (minOrderAmount <= 0) {
            newErrors.minOrderAmount = 'Số tiền đặt hàng tối thiểu phải lớn hơn 0.'
        }
        if (minOrderAmount > 10000000000) {
            newErrors.minOrderAmount = 'Số tiền đặt hàng tối thiểu không được vượt quá 1.000.000.000.'
        }

        if (usePercentage) {
            if (value <= 0 || value > 50) {
                newErrors.value = 'Tỷ lệ giảm giá phải từ 1% đến 50%.'
            }
            if (maxDiscountAmount && maxDiscountAmount > 5000000) {
                newErrors.maxDiscountAmount =
                    'Số tiền giảm giá tối đa không được vượt quá 5.000.000 VNĐ đối với các khuyến mãi theo tỷ lệ phần trăm.'
            }
        } else {
            if (value <= 0) {
                newErrors.value = 'Số tiền giảm giá phải lớn hơn 0.'
            }
            if (value > 5000000) {
                newErrors.value = 'Số tiền giảm giá không nên vượt quá 5.000.000 VNĐ.'
            }
            if (maxDiscountAmount && maxDiscountAmount > 5000000) {
                newErrors.maxDiscountAmount = 'Số tiền  giảm giá tối đa không được vượt quá 5.000.000 VNĐ.'
            }
        }

        if (perCustomerLimit <= 0) {
            newErrors.perCustomerLimit = 'Lượt sử dụng của khách hàng phải lớn hơn 0.'
        }

        if (perCustomerLimit > 5) {
            newErrors.perCustomerLimit = 'Lượt sử dụng của khách hàng không vượt quá 5.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    useEffect(() => {
        fetchDefaultBirthdayVoucher()
    }, [])

    return (
        <div className='card p-5'>
            <Toast ref={toast} />
            <h2 className='text-center mb-4'>Voucher sinh nhật mặc định</h2>
            <div className='p-fluid grid mt-4'>
                <div className='col-12'>
                    <div className='field'>
                        <label htmlFor='voucherName'>Tên voucher</label>
                        <InputText
                            type='text'
                            disabled
                            id='voucherName'
                            value={discountName}
                            onChange={(e) => setDiscountName(e.target.value)}
                            required
                            placeholder='Nhập tên voucher'
                        />
                        {errors.discountName && <small className='p-error'>{errors.discountName}</small>}
                    </div>
                    <div className='field'>
                        <div className='flex align-items-center gap-3'>
                            <span>Sử dụng tỷ lệ phần trăm</span>
                            <InputSwitch
                                id='discountTypeSwitch'
                                checked={usePercentage}
                                onChange={(e) => {
                                    const newValue = e.value
                                    setUsePercentage(newValue)
                                    if (!newValue) {
                                        setMaxDiscountAmount(null)
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex'>
                        <div className='field'>
                            <label htmlFor='value'>Giá trị giảm giá</label>
                            <InputNumber
                                inputId='value'
                                value={value}
                                showButtons
                                onValueChange={(e) => setValue(e.value ?? 0)}
                                suffix={usePercentage ? '%' : ''}
                                mode={usePercentage ? 'decimal' : 'currency'}
                                currency='VND'
                                locale='vi-VN'
                                min={usePercentage ? 1 : 0.1}
                                max={usePercentage ? 50 : 100000000}
                                required
                                placeholder='Nhập giá trị giảm giá'
                            />
                        </div>
                        {usePercentage && (
                            <div className='field ml-5'>
                                <label className='w-full' htmlFor='maxDiscountAmount'>
                                    Số tiền giảm giá tối đa
                                </label>
                                <InputNumber
                                    id='maxDiscountAmount'
                                    value={maxDiscountAmount}
                                    prefix=''
                                    onValueChange={(e) => setMaxDiscountAmount(e.value ?? 0)}
                                    min={1}
                                    max={5000000}
                                    mode='currency'
                                    currency='VND'
                                    locale='vi-VN'
                                    showButtons
                                />
                                {errors.maxDiscountAmount && (
                                    <small className='p-error'>{errors.maxDiscountAmount}</small>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='field'>
                        <label htmlFor='minOderAmount'>Số tiền đặt hàng tối thiểu</label>
                        <InputNumber
                            id='minOderAmount'
                            value={minOrderAmount}
                            onValueChange={(e) => setMinOrderAmount(e.value ?? 0)}
                            prefix=''
                            mode='currency'
                            currency='VND'
                            locale='vi-VN'
                            min={1}
                            max={100000000}
                            showButtons
                        />
                        {errors.minOrderAmount && <small className='p-error'>{errors.minOrderAmount}</small>}
                    </div>
                    <div className='my-4'>
                        <Checkbox
                            id='ingredient'
                            onChange={(e) => setIsCumulative(e.checked ?? false)}
                            checked={isCumulative}
                        />
                        <label htmlFor='ingredient' className='ml-2'>
                            Cộng dồn với các giảm giá khác
                        </label>
                    </div>
                    <div className='flex justify-between'>
                        <div className='field flex items-center gap-4 mb-0'>
                            <label className='mb-0' htmlFor='limitationTimes'>
                                Thời gian giới hạn
                            </label>
                            <InputNumber
                                style={{ width: '80px' }}
                                id='limitationTimes'
                                value={limitationTimes}
                                onValueChange={(e) => setLimitationTimes(e.value ?? 0)}
                            />
                            {errors.limitationTimes && <small className='p-error'>{errors.limitationTimes}</small>}
                        </div>
                        <div className='field flex items-center gap-4 mb-0'>
                            <label className='mb-0' htmlFor='perCustomerLimit'>
                                Lượt sử dụng / khách hàng
                            </label>
                            <InputNumber
                                style={{ width: '80px' }}
                                id='perCustomerLimit'
                                value={perCustomerLimit}
                                onValueChange={(e) => setPerCustomerLimit(e.value ?? 0)}
                            />
                            {errors.perCustomerLimit && <small className='p-error'>{errors.perCustomerLimit}</small>}
                        </div>
                    </div>
                    <Button className='mt-4' label='Update Voucher' icon='pi pi-check' onClick={handleUpdateVoucher} />
                </div>
            </div>
        </div>
    )
}

export default VoucherUpdateDefaultBirthday
