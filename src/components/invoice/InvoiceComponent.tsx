import React from 'react'
import Image from 'next/image'
import { InvoiceData } from '@/interface/order.interface'
import dayjs from 'dayjs'

interface InvoiceComponentProps {
    data: InvoiceData
}

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({ data }) => {
    return (
        <div className=' bg-gray-100 py-6 flex flex-col justify-center sm:py-12'>
            <div className='relative  sm:max-w-xl sm:mx-auto'>
                <div className='absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl'></div>
                <div className='relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20'>
                    <div className='max-w-md mx-auto'>
                        <div className='flex items-center justify-between'>
                            <Image
                                src={'/layout/images/ViStore.png'}
                                alt='Company Logo'
                                width={48} // 12 * 4 for h-12
                                height={48}
                                priority
                            />
                            <h1 className='text-2xl font-semibold text-gray-700'>Hóa Đơn</h1>
                        </div>

                        <div className='flex justify-between '>
                            <div className='w-1/2 '>
                                <h2 className='text-lg font-semibold text-gray-700'> {data.company.name}</h2>
                                <p className='text-sm text-gray-500'>Địa chỉ: {data.company.address}</p>
                                <p className='text-sm text-gray-500'>Số điện thoại: {data.company.phone}</p>
                                <p className='text-sm text-gray-500'>Email: {data.company.email}</p>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-gray-700'>Số hóa đơn: {data.invoiceNumber}</p>
                                <p className='text-sm text-gray-500'>
                                    Ngày: {dayjs(data.date).format('DD/MM/YYYY HH:mm')}
                                </p>
                            </div>
                        </div>

                        <div className=''>
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>Khách hàng:</h3>
                            {data.client.name && (
                                <p className='text-sm text-gray-600'>Tên khách hàng: {data.client.name}</p>
                            )}
                            {data.client.address && (
                                <p className='text-sm text-gray-600'>Địa chỉ: {data.client.address}</p>
                            )}
                            {data.client.email && <p className='text-sm text-gray-600'>Email: {data.client.email}</p>}
                            {data.client.phone && (
                                <p className='text-sm text-gray-600'>Số điện thoại: {data.client.phone}</p>
                            )}
                        </div>

                        <table className='w-full '>
                            <thead>
                                <tr className='text-sm font-medium text-gray-700 border-b border-gray-200'>
                                    <th className='py-2 text-left'>Sản phẩm</th>
                                    <th className='py-2 text-right'>Số lượng</th>
                                    <th className='py-2 text-right'>Đơn giá</th>
                                    <th className='py-2 text-right'>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item, index) => (
                                    <tr key={index} className='text-sm text-gray-600'>
                                        <td className='py-2 text-left'>{item.productName}</td>
                                        <td className='py-2 text-right'>{item.quantity}</td>
                                        <td className='py-2 text-right'>${item.rate.toFixed(2)}</td>
                                        <td className='py-2 text-right'>${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className='flex justify-end '>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600 mb-1'>Tổng tiền: ${data.total.toFixed(2)}</p>
                                <p className='text-sm text-gray-600 mb-1'>Giảm giá : ${data.discount.toFixed(2)}</p>
                                <p className='text-lg font-semibold text-gray-700'>
                                    Tổng cộng: ${data.subtotal.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <h6 className='text-center text-gray-600'>Cảm ơn bạn đã mua hàng tại ViStore</h6>
                </div>
            </div>
        </div>
    )
}

export default InvoiceComponent
