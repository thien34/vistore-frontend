import { useContext } from 'react'
import { LayoutContext } from './context/layoutcontext'
import { MenuProvider } from './context/menucontext'
import Link from 'next/link'
import Image from 'next/image'
import { AppMenuItem } from '@/types'
import AppMenuitem from './AppMenuitem'

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext)

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Retail',
            items: [{ label: 'Retail Sales', icon: 'pi pi-fw pi-shop', to: '/admin/retail' }]
        },
        {
            label: 'Orders',
            items: [{ label: 'Orders', icon: 'pi pi-fw pi-table', to: '/admin/orders' }]
        },
        {
            label: 'Catalog',
            items: [
                { label: 'Products', icon: 'pi pi-fw pi-box', to: '/admin/products' },
                { label: 'Categories', icon: 'pi pi-fw pi-objects-column', to: '/admin/categories' },
                { label: 'Manufacturers', icon: 'pi pi-fw pi-sitemap', to: '/admin/manfacturers' },
                { label: 'Product tags', icon: 'pi pi-fw pi-bookmark', to: '/admin/product-tags' },
                { label: 'Product attributes', icon: 'pi pi-fw pi-th-large', to: '/admin/product-attributes' },
                {
                    label: 'Specification attributes',
                    icon: 'pi pi-fw pi-mobile',
                    to: '/uikit/button'
                },
                { label: 'Discounts', icon: 'pi pi-fw pi-tags', to: '/admin/discounts' },
                { label: 'Customers', icon: 'pi pi-fw pi-users', to: '/admin/customers' },
                { label: 'Customer roles', icon: 'pi pi-fw pi-key', to: '/admin/customer-roles' }
            ]
        },
        {
            label: 'Orders',
            items: [
                { label: 'Orders', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
                {
                    label: 'Return Goods', icon: 'pi pi-reply',
                    items: [
                        {
                            label: 'Return Management', icon: 'pi pi-briefcase',
                            items: [
                                { label: 'Return Invoice', icon: '', to: '/admin/return-product/management/return-invoice' },
                                { label: 'Return Request', icon: '', to: '/admin/return-product/management/return-request' },
                            ]
                        },
                        {
                            label: 'Return Item Tracking', icon: 'pi pi-box',
                            items: [
                                { label: 'Awaiting Approval', to: '/admin/return-product/item-tracking/awaiting-approval' },
                                { label: 'Approved Return', to: '/admin/return-product/item-tracking/approved-return' },
                            ]
                        }
                    ]
                },
                { label: 'Recurring payments', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
                { label: 'Carts & Wishlists', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' }
            ]
        },
        {
            label: 'Pages',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/pages/notfound'
                }
            ]
        },
        {
            label: 'Get Started',
            items: [
                {
                    label: 'Documentation',
                    icon: 'pi pi-fw pi-question',
                    to: '/documentation'
                },
                {
                    label: 'View Source',
                    icon: 'pi pi-fw pi-search',
                    url: 'https://github.com/thien34',
                    target: '_blank'
                }
            ]
        }
    ]

    return (
        <MenuProvider>
            <ul className='layout-menu'>
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className='menu-separator'></li>
                    )
                })}
                <Link href='https://blocks.primereact.org' target='_blank' style={{ cursor: 'pointer' }}>
                    <Image
                        alt='Prime Blocks'
                        className='w-full mt-3'
                        src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`}
                        width={500}
                        height={150}
                    />
                </Link>
            </ul>
        </MenuProvider>
    )
}

export default AppMenu
