'use client'
import { RoleName } from '@/interface/role.interface'
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { useRef, useState } from 'react'
import { RadioButton } from 'primereact/radiobutton'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Customer } from '@/interface/customer.interface'
import { Calendar } from 'primereact/calendar'
import { classNames } from 'primereact/utils'
import customerService from '@/service/customer.service'
import { useRouter } from 'next/navigation'
import RequiredIcon from '@/components/icon/RequiredIcon'
import Link from 'next/link'
import Image from 'next/image'
interface FormProps {
    roles: RoleName[]
}
const emptyCustomer: Customer = {
    email: '',
    firstName: '',
    lastName: '',
    gender: '0',
    dateOfBirth: null,
    customerRoles: []
}
const domains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com']
const genders = [
    { name: 'Nam', key: '0' },
    { name: 'Nữ', key: '1' }
]

const CustomerForm = ({ roles }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [items, setItems] = useState<string[]>([])
    const [customer, setCustomer] = useState<Customer>(emptyCustomer)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const search = (event: AutoCompleteCompleteEvent) => {
        setItems(domains.map((item) => event.query + item))
    }

    const saveCustomer = async () => {
        setSubmitted(true)
        if (customer.email.trim()) {
            await customerService.create(customer)
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Khách hàng đã được tạo',
                life: 3000
            })
            router.push('/admin/customers')
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className='flex'>
                <div className='col-12 md:col-8'>
                    <div className='card'>
                        <div className='flex justify-between items-center gap-2'>
                            <h4>Thêm Khách Hàng</h4>
                            <Link href={`/admin/customers`}>
                                <Image src={'/layout/images/btn-back.png'} alt='ViStore' width='20' height='20' />
                            </Link>
                        </div>
                        <div className='field'>
                            <label htmlFor='email' className='font-medium w-full'>
                                Email <RequiredIcon />
                            </label>
                            <AutoComplete
                                inputId='email'
                                delay={230}
                                inputStyle={{ width: '100%' }}
                                value={customer.email}
                                suggestions={items}
                                completeMethod={search}
                                required
                                autoFocus
                                onChange={(e) => setCustomer({ ...customer, email: e.value })}
                                placeholder='Nhập email của bạn'
                                className={classNames({ 'p-invalid': submitted && !customer.email }, 'w-full')}
                            />
                            {submitted && !customer.email && <small className='p-error'>Email là bắt buộc.</small>}
                        </div>
                        <div className='flex flex-wrap'>
                            <div className='field'>
                                <label htmlFor='firstName' className='font-medium w-full'>
                                    Tên Khách Hàng <RequiredIcon />
                                </label>
                                <InputText
                                    id='firstName'
                                    value={customer.firstName}
                                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                                    required
                                    className={classNames({ 'p-invalid': submitted && !customer.firstName })}
                                />
                                {submitted && !customer.firstName && (
                                    <small className='p-error block'>Tên khách hàng là bắt buộc.</small>
                                )}
                            </div>
                            <div className='field'>
                                <label htmlFor='lastName' className='font-medium w-full'>
                                    Họ Khách Hàng <RequiredIcon />
                                </label>
                                <InputText
                                    id='lastName'
                                    value={customer.lastName}
                                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                                    required
                                    className={classNames({ 'p-invalid': submitted && !customer.lastName })}
                                />
                                {submitted && !customer.lastName && (
                                    <small className='p-error block'>Họ khách hàng là bắt buộc.</small>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-wrap'>
                            <div className='field'>
                                <label htmlFor='dob' className='font-medium w-full'>
                                    Ngày Sinh <RequiredIcon />
                                </label>
                                <Calendar
                                    inputId='dob'
                                    readOnlyInput
                                    value={customer.dateOfBirth}
                                    onChange={(e) => setCustomer({ ...customer, dateOfBirth: e.value || null })}
                                    maxDate={new Date()}
                                    className={classNames({
                                        'p-invalid':
                                            submitted && (!customer.dateOfBirth || customer.dateOfBirth > new Date())
                                    })}
                                />
                                {submitted && !customer.dateOfBirth && (
                                    <small className='p-error block'>Ngày sinh là bắt buộc.</small>
                                )}
                                {submitted && customer.dateOfBirth && customer.dateOfBirth > new Date() && (
                                    <small className='p-error block'>Ngày sinh không được là ngày ở tương lai.</small>
                                )}
                            </div>
                            <div className='field'>
                                <div className='flex flex-wrap gap-3'>
                                    <label htmlFor='name' className='font-medium w-full'>
                                        Giới Tính
                                    </label>
                                    {genders.map((gender) => {
                                        return (
                                            <div key={gender.key} className='flex align-items-center'>
                                                <RadioButton
                                                    inputId={gender.key}
                                                    name='gender'
                                                    value={gender}
                                                    onChange={(e) => setCustomer({ ...customer, gender: e.value.key })}
                                                    checked={customer.gender === gender.key}
                                                />
                                                <label htmlFor={gender.key} className='ml-2'>
                                                    {gender.name}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-12 md:col-4'>
                    <div className='card'>
                        <div className='text-xl font-medium mb-6'>Vai Trò</div>
                        <div className='field'>
                            <label htmlFor='roleName' className='font-medium w-full'>
                                Tên Vai Trò <RequiredIcon />
                            </label>
                            <Dropdown
                                inputId='roleName'
                                value={roles.find((role) => role.id === customer.customerRoles[0])}
                                onChange={(e) => setCustomer({ ...customer, customerRoles: [e.value.id] })}
                                options={roles}
                                optionLabel='name'
                                style={{ width: '100%' }}
                                placeholder='Chọn một vai trò'
                                className={classNames(
                                    { 'p-invalid': submitted && customer.customerRoles.length < 1 },
                                    'md:w-full'
                                )}
                            />
                            {submitted && customer.customerRoles.length < 1 && (
                                <small className='p-error block'>Vai trò của khách hàng là bắt buộc.</small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-3'>
                <Button label='Lưu' onClick={() => saveCustomer()} />
            </div>
        </>
    )
}
export default CustomerForm
