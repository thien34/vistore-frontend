'use client'
import CartService from '@/service/cart.service'
import { Button } from 'primereact/button'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'
import { useLocalStorage, useUpdateEffect } from 'primereact/hooks'
import { TabPanel, TabPanelHeaderTemplateOptions, TabView } from 'primereact/tabview'
import { Toast } from 'primereact/toast'
import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { TiShoppingCart } from 'react-icons/ti'
import { Badge } from 'primereact/badge'
import ProductListComponent from './_components/ProductList'

type Tab = {
    id: string
    header: string
    content: JSX.Element
    billId: string
    totalItems: number
}

export default function Retail() {
    const [tabs, setTabs] = useState<Tab[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [billId, setBillId] = useLocalStorage<string>('billId', '')
    const toast = useRef<Toast>(null)

    useUpdateEffect(() => {
        fetchBill()
    }, [billId])

    const fetchBill = () => {
        CartService.getBills().then((res) => {
            if (res) {
                const billData = res as unknown as Record<string, { numberBill: number; totalItems: number }>
                const newTabs = Object.entries(billData)
                    .sort(([, { numberBill: a }], [, { numberBill: b }]) => a - b)
                    .map(([billId, { numberBill, totalItems }]) => ({
                        id: billId,
                        header: `Bill ${numberBill}`,
                        content: (
                            <ProductListComponent
                                updateTabTotalItems={updateTabTotalItems}
                                fetchBill={fetchBill}
                                numberBill={numberBill}
                            />
                        ),
                        billId: billId,
                        totalItems: totalItems
                    }))

                setTabs(newTabs)
                setBillId(newTabs[0]?.id || '')
                localStorage.setItem('billIdCurrent', newTabs[0]?.id || '')
            }
        })
    }

    const tabHeaderTemplate = (options: TabPanelHeaderTemplateOptions, header: string, totalItems: number) => {
        return (
            <div className='flex align-items-center gap-2 p-3' style={{ cursor: 'pointer' }} onClick={options.onClick}>
                <span className='font-bold white-space-nowrap'>{header}</span>
                <div style={{ position: 'relative' }}>
                    {totalItems > 0 && (
                        <Badge
                            value={totalItems.toString()}
                            size='normal'
                            severity='danger'
                            style={{ position: 'absolute', top: '-10px', right: '-13px' }}
                        />
                    )}
                    <TiShoppingCart size={26} />
                </div>
                <Button
                    icon='pi pi-times'
                    className='p-button-rounded p-button-text p-button-sm ml-2'
                    onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(options.index, header, e.currentTarget)
                    }}
                />
            </div>
        )
    }

    const addTab = async () => {
        const newId = uuidv4()
        const newHeader = `Hóa đơn ${tabs.length + 1}`
        if (tabs.length >= 10) {
            showError()
            return
        }
        await CartService.addBill(newId)
        setBillId(newId)
        setTabs([
            ...tabs,
            {
                id: newId,
                header: newHeader,
                content: (
                    <ProductListComponent
                        updateTabTotalItems={updateTabTotalItems}
                        fetchBill={fetchBill}
                        numberBill={tabs.length + 1}
                    />
                ),
                billId: newId,
                totalItems: 0
            }
        ])
        setActiveIndex(tabs.length)
    }

    const removeTab = (tabIndex: number, billId: string) => {
        const newTabs = tabs.filter((_, index) => index !== tabIndex)

        CartService.deleteBill(billId)
        setTabs(newTabs)

        if (newTabs.length > 0) {
            if (tabIndex === activeIndex) {
                const newActiveIndex = tabIndex === newTabs.length ? activeIndex - 1 : activeIndex
                setActiveIndex(newActiveIndex)
                setBillId(newTabs[newActiveIndex].billId)
            } else {
                setActiveIndex(activeIndex > tabIndex ? activeIndex - 1 : activeIndex)
                setBillId(newTabs[activeIndex > tabIndex ? activeIndex - 1 : activeIndex].billId)
            }
        } else {
            setActiveIndex(0)
            setBillId('')
        }
    }

    const handleTabChange = (e: { index: number }) => {
        const currentTabId = tabs[e.index].id
        localStorage.setItem('billIdCurrent', currentTabId)
        setActiveIndex(e.index)
        setBillId(currentTabId)
    }

    const showError = () => {
        toast.current?.show({
            severity: 'error',
            summary: 'Cảnh báo',
            detail: 'Tạo tối đa 10 đơn',
            life: 1000
        })
    }

    const confirmDelete = (tabIndex: number, header: string, target: HTMLElement) => {
        const billId = tabs[tabIndex].billId
        confirmPopup({
            message: `Do you want to delete this ${header} ?`,
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            target: target,
            accept: () => removeTab(tabIndex, billId)
        })
    }

    const updateTabTotalItems = (billId: string, newTotalItems: number) => {
        setTabs((prevTabs) =>
            prevTabs.map((tab) => (tab.billId === billId ? { ...tab, totalItems: newTotalItems } : tab))
        )
    }

    return (
        <div className='card'>
            <div className='flex justify-between items-center'>
                <h2 className=''>Bán hàng tại quầy</h2>
                <Button label='Tạo Hóa Đơn' onClick={addTab} />
            </div>
            <TabView className='mt-5' activeIndex={activeIndex} onTabChange={handleTabChange}>
                {tabs.map((tab) => (
                    <TabPanel
                        key={tab.id}
                        closable
                        headerTemplate={(options) => tabHeaderTemplate(options, tab.header, tab.totalItems)}
                    >
                        {tab.content}
                    </TabPanel>
                ))}
            </TabView>
            <ConfirmPopup />
            <Toast ref={toast} />
        </div>
    )
}
