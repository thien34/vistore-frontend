'use client'
import { RoleName } from '@/interface/role.interface'
import { AutoComplete } from 'primereact/autocomplete'
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
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { AddressesResponse, Province } from '@/interface/address.interface'
import AddressForm from './AddressForm'
import addressService from '@/service/address.service'
import RequiredIcon from '@/components/icon/RequiredIcon'
import Link from 'next/link'
import Image from 'next/image'
interface FormProps {
    roles: RoleName[]
    initialData: Customer
    initAddresses: AddressesResponse[]
    provinces: Province[]
    customerId: number
}

const genders = [
    { name: 'Nam', key: '0' },
    { name: 'Nữ', key: '1' }
]

const activities = [
    { name: 'Hoạt động', key: true },
    { name: 'Ngừng hoạt động', key: false }
]

const CustomerForm = ({ roles, initialData, initAddresses, provinces, customerId }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [addresses, setAddresses] = useState<AddressesResponse[]>(initAddresses)
    const [customer, setCustomer] = useState<Customer>(initialData)
    const [submitted, setSubmitted] = useState(false)
    const [selectedAddreses, setSelectedAddreses] = useState<AddressesResponse>()
    const [globalFilter, setGlobalFilter] = useState('')
    const dt = useRef<DataTable<AddressesResponse[]>>(null)
    const router = useRouter()

    const addressFormRef = useRef<{ openNew: (idAddress: number | null) => void }>(null)
    const openAddressDialog = (idAddress: number | null) => {
        addressFormRef.current?.openNew(idAddress)
    }

    const fetchAddresses = async () => {
        const { payload: data } = await addressService.getAll(customerId)
        setAddresses(data.items)
    }

    const saveCustomer = async () => {
        if (customer == initialData) {
            router.push('/admin/customers')
            return
        }
        setSubmitted(true)
        if (customer.email.trim()) {
            await customerService.update(customerId, customer)
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Khách hàng đã được cập nhật',
                life: 3000
            })
            router.push('/admin/customers')
        }
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Quản Lý Địa Chỉ</h5>
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

    const actionBodyTemplate = (rowData: Customer) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => openAddressDialog(rowData.id ?? null)}
                />
                <Button
                    icon='pi pi-trash'
                    rounded
                    outlined
                    severity='danger'
                    // onClick={() => confirmDeleteProduct(rowData)}
                />
            </>
        )
    }

    return (
        <>
            <Toast ref={toast} />
            <div className='flex gap-x-4'>
                <div className='w-2/3'>
                    <div className='card h-full'>
                        <div className='flex justify-between items-center gap-2'>
                            <h4>Cập Nhật Khách Hàng</h4>
                            <Link href={`/admin/customers`}>
                                <Image src={'/layout/images/btn-back.png'} alt='ViStore' width='20' height='20' />
                            </Link>
                        </div>
                        <div className='field'>
                            <label htmlFor='email' className='font-medium w-full'>
                                Email
                            </label>
                            <AutoComplete
                                inputId='email'
                                readOnly
                                delay={230}
                                inputStyle={{ width: '100%' }}
                                value={customer.email}
                                onChange={(e) => setCustomer({ ...customer, email: e.value })}
                                className={'w-full'}
                            />
                            <small className='p-info'>Email không thể cập nhật.</small>
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
                                    Ngày sinh
                                </label>
                                <Calendar
                                    inputId='dob'
                                    readOnlyInput
                                    value={customer.dateOfBirth ? new Date(customer.dateOfBirth) : null}
                                    onChange={(e) => setCustomer({ ...customer, dateOfBirth: e.value || null })}
                                    className={classNames({ 'p-invalid': submitted && !customer.dateOfBirth })}
                                />
                                {submitted && !customer.dateOfBirth && (
                                    <small className='p-error block'>Ngày sinh là bắt buộc.</small>
                                )}
                            </div>
                            <div className='field'>
                                <div className='field flex flex-wrap gap-3'>
                                    <label htmlFor='name' className='font-medium w-full'>
                                        Giới Tính
                                    </label>
                                    {genders.map((gender) => {
                                        return (
                                            <div key={gender.key} className='flex align-items-center'>
                                                <RadioButton
                                                    inputId={gender.key}
                                                    name='gender'
                                                    value={gender.key}
                                                    onChange={(e) => setCustomer({ ...customer, gender: e.value })}
                                                    checked={customer.gender == gender.key}
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
                <div className='w-1/3'>
                    <div className='card mb-4'>
                        <div className='text-xl font-medium mb-6'>Vai Trò</div>
                        <div className='field'>
                            <Dropdown
                                value={roles.find((role) => role.id === customer.customerRoles[0])}
                                onChange={(e) => setCustomer({ ...customer, customerRoles: [e.value.id] })}
                                options={roles}
                                optionLabel='name'
                                style={{ width: '100%' }}
                            />
                            <div className='flex items-center gap-x-1 mt-2'>
                                <i className='pi pi-exclamation-circle'></i>
                                <small className='p-info'>Vai trò này quyết định quyền hạn của khách hàng</small>
                            </div>
                        </div>
                    </div>
                    <div className='card'>
                        <div className='text-xl font-medium mb-6'>Trạng Thái</div>
                        <div className='field'>
                            <Dropdown
                                value={activities.find((active) => active.key === customer.active)}
                                onChange={(e) => setCustomer({ ...customer, active: e.value.key })}
                                options={activities}
                                optionLabel='name'
                                style={{ width: '100%' }}
                            />
                            <div className='flex items-center gap-x-1 mt-2'>
                                <i className='pi pi-exclamation-circle'></i>
                                <small className='p-info'>Trạng thái tài khoản của người dùng.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card mt-2'>
                <div className='flex justify-content-between align-items-center mb-6'>
                    <div className='text-xl font-medium'>Địa chỉ</div>
                    <Button label='Thêm địa chỉ mới' onClick={() => openAddressDialog(null)} />
                </div>
                <DataTable
                    ref={dt}
                    value={addresses}
                    selection={selectedAddreses}
                    onSelectionChange={(e) => setSelectedAddreses(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} địa chỉ'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy địa chỉ nào'
                    header={header}
                >
                    <Column
                        selectionMode='multiple'
                        headerStyle={{
                            width: '4rem'
                        }}
                    />
                    <Column
                        field='name'
                        header='Tên'
                        body={(rowData: AddressesResponse) => `${rowData.firstName} ${rowData.lastName}`}
                        sortable
                    />
                    <Column field='email' header='Email' sortable />
                    <Column field='phoneNumber' header='Số Điện Thoại' sortable />
                    <Column field='addressDetail' header='Địa Chỉ' sortable />
                    <Column body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
            <div className='my-3'>
                <Button label='Lưu' onClick={() => saveCustomer()} />
            </div>
            <AddressForm
                provinces={provinces}
                ref={addressFormRef}
                customerId={customerId}
                fetchAdresses={fetchAddresses}
            />
        </>
    )
}
export default CustomerForm
