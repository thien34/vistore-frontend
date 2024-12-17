/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { useRef, useState } from 'react'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { DataTableFilterMeta } from 'primereact/datatable'
import { Button } from 'primereact/button'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import ProductService from '@/service/ProducrService'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { CartResponse, ShoppingCart } from '@/interface/cart.interface'
import CartService from '@/service/cart.service'
import { v4 as uuidv4 } from 'uuid'
import ProductDialog from './ProductDialog'
import QuantityDialog from './QuantityDialog'
import CartItem from './CartItem'
import { confirmPopup } from 'primereact/confirmpopup'
import { Toast } from 'primereact/toast'
import CustommerOrder from './CustommerOrder'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Dialog } from 'primereact/dialog'
import { BsQrCodeScan } from 'react-icons/bs'
import Image from 'next/image'
const defaultFilters: DataTableFilterMeta = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    'country.name': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },

    balance: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS }
}

interface ProductListComponentProps {
    updateTabTotalItems: (billId: string, newTotalItems: number) => void
    fetchBill: () => void
    numberBill: number
    billId: string
}

export default function ProductListComponent({
    updateTabTotalItems,
    fetchBill,
    numberBill,
    billId
}: ProductListComponentProps) {
    const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters)
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('')
    const [product, setProduct] = useState<ProductResponseDetails>()
    const [quantity, setQuantity] = useState<number>(1)
    const [carts, setCarts] = useState<CartResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const toast = useRef<Toast>(null)
    const [visibleScan, setVisibleScan] = useState<boolean>(false)
    const [, setScanResult] = useState<string>('')
    const [totalWeight, setTotalWeight] = useState<number>(0)
    const [, setAmountPaidLocal] = useLocalStorage<number>(0, 'amountPaid')

    const [orderTotals, setOrderTotals] = useState<{
        subtotal: number
        shippingCost: number
        tax: number
        total: number
        discount: number
    }>({ subtotal: 0, shippingCost: 0, tax: 0, total: 0, discount: 0 })

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const _filters = { ...filters }

        // @ts-ignore
        _filters['global'].value = value

        setFilters(_filters)
        setGlobalFilterValue(value)
    }

    const [visible, setVisible] = useState<boolean>(false)
    const [visibleQuantity, setVisibleQuantity] = useState<boolean>(false)

    const fetchProducts = () => {
        ProductService.getProuctsDetails().then((res) => {
            const data = res.filter((product) => product.quantity > 0)
            setProducts(data)
        })
    }

    useMountEffect(() => {
        fetchProducts()
    })

    useUpdateEffect(() => {
        fetchCart()
    }, [billId])

    const fetchCart = () => {
        CartService.getCart(billId)
            .then((res) => {
                const sortedCarts = res.sort((a, b) => a.cartUUID.localeCompare(b.cartUUID))

                setCarts(sortedCarts)
                updateTabTotalItems(billId, res.length)
                calculateTotals(res)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const calculateTotals = (carts: CartResponse[]) => {
        const subtotal = carts.reduce((total, cartItem) => {
            const price = cartItem.productResponse.discountPrice || cartItem.productResponse.price
            return total + price * cartItem.quantity
        }, 0)

        const totalWeight = carts.reduce((total, cartItem) => {
            return total + cartItem.productResponse.weight * cartItem.quantity
        }, 0)

        const orderTotals = {
            subtotal,
            shippingCost: 30000,
            tax: 0,
            discount: 0,
            total: subtotal
        }
        setOrderTotals(orderTotals)
        setTotalWeight(totalWeight)
        setAmountPaidLocal(subtotal)
    }

    const addProductToCart = (product: ProductResponseDetails) => {
        setProduct(product)
        setVisibleQuantity(true)
    }

    const addProductToCartHandler = () => {
        if (quantity === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Số lượng không thể bằng 0',
                life: 1000
            })
            return
        }
        const cart: ShoppingCart = {
            cartUUID: uuidv4(),
            productId: product?.id ?? null,
            quantity: quantity,
            customerId: 1,
            isAdmin: true
        }

        CartService.addProductToCart(cart, billId)
            .then(() => {
                setVisibleQuantity(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Sản phẩm được thêm vào giỏ hàng thành công',
                    life: 1000
                })
                fetchProducts()
                fetchCart()
            })
            .catch((error) => {
                console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error instanceof Error ? error.message : 'An error occurred',
                    life: 3000
                })
            })
        setQuantity(1)
    }

    function handleCartItemDelete(cart: CartResponse, event: React.MouseEvent<HTMLElement>): void {
        confirmPopup({
            target: event.currentTarget,
            message: 'Bạn có chắc chắn muốn xóa mặt hàng này khỏi giỏ hàng không?',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => {
                CartService.deleteItemInBill(cart.cartUUID)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Xóa giỏ hàng thành công',
                            life: 1000
                        })
                        fetchCart()
                    })
                    .catch((error) => {
                        console.error('Lỗi xóa mục giỏ hàng:', error)
                    })
            }
        })
    }
    const handleScanResult = (result: string) => {
        setScanResult(result)
        const product = products.find((p) => p.gtin === result)
        if (product) {
            addProductToCart(product as unknown as ProductResponseDetails)
            setVisibleScan(false)
        } else {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Không tìm thấy mã QR',
                life: 1000
            })
        }
    }

    const onOpenProductDialog = () => {
        fetchProducts()
        setVisible(true)
        setVisibleScan(false)
    }

    return (
        <div>
            <div className='flex justify-between'>
                <h4>Đặt hàng sản phẩm</h4>
                <div className='flex gap-2'>
                    <Button onClick={() => setVisibleScan(true)}>
                        <BsQrCodeScan />
                    </Button>
                    <Button onClick={() => onOpenProductDialog()}>Thêm Sản Phẩm</Button>
                </div>
            </div>

            <Dialog
                header='Scan QR'
                visible={visibleScan}
                style={{ width: '25vw', height: '55vh' }}
                onHide={() => {
                    if (!visibleScan) return
                    setVisibleScan(false)
                }}
            >
                <Scanner onScan={(result) => handleScanResult(result[0].rawValue)} />
            </Dialog>

            <Toast ref={toast} />

            <ProductDialog
                products={products}
                visible={visible}
                setVisible={setVisible}
                filters={filters}
                setFilters={setFilters}
                addProductToCart={(product: ProductResponse) => {
                    addProductToCart(product as unknown as ProductResponseDetails)
                }}
                globalFilterValue={globalFilterValue}
                onGlobalFilterChange={onGlobalFilterChange}
            />
            <QuantityDialog
                visible={visibleQuantity}
                setVisible={setVisibleQuantity}
                product={product || null}
                quantity={quantity}
                setQuantity={setQuantity}
                onSave={addProductToCartHandler}
            />
            {carts.length > 0 && (
                <div className='space-y-4 card mt-2'>
                    {carts.map((cart) => (
                        <CartItem
                            key={cart.id}
                            cart={cart}
                            onQuantityChange={fetchCart}
                            onDelete={() => handleCartItemDelete(cart, {} as React.MouseEvent<HTMLElement>)}
                        />
                    ))}
                </div>
            )}
            {carts.length > 0 && (
                <>
                    <hr className='my-4 border-1 border-gray-300' />
                    <CustommerOrder
                        orderTotals={orderTotals}
                        totalWeight={totalWeight}
                        fetchBill={fetchBill}
                        numberBill={numberBill}
                        billId={billId}
                    />
                </>
            )}
            {carts.length === 0 && (
                <div className='flex justify-center items-center h-[50vh]'>
                    <Image src={'/layout/images/empty-cart.png'} alt='ViStore' width='200' height='200' />
                </div>
            )}
        </div>
    )
}
