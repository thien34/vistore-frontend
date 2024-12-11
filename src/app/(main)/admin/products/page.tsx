'use client'
import { useEffect, useRef, useState } from 'react'
import ProductService from '@/service/ProducrService'
import ProductList from './details/_components/ProductList'
import { ProductFilter, ProductResponse } from '@/interface/Product'
import Spinner from '@/components/spinner/Spinner'
import categoryService from '@/service/category.service'
import manufacturerService from '@/service/manufacturer.service'
import { CategoryName } from '@/interface/category.interface'
import { ManufacturerName } from '@/interface/manufacturer.interface'
import ProductFilterTaskbar from './details/_components/ProductFilter'

export default function ProductPage() {
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [categories, setCategories] = useState<CategoryName[]>([])
    const [manufacturer, setManufacturer] = useState<ManufacturerName[]>([])
    const [filter, setFilter] = useState<ProductFilter>({})
    const prevFilter = useRef(filter);
    const [isLoading, setIsLoading] = useState(true)
    async function fetchProducts() {
        setIsLoading(true)
        try {
            const data = await ProductService.getAllProducts(filter)
            setProducts(data)
        } catch (error) {
            console.error('Không thể gọi sản phẩm:', error)
        } finally {
            setIsLoading(false)
        }
    }
    async function fetchDropdownCategories() {
        setIsLoading(true)
        try {
            const data = await categoryService.getListName()
            setCategories(data.payload)
        } catch (error) {
            console.error('Không thể gọi danh sách danh mục:', error)
        } finally {
            setIsLoading(false)
        }
    }
    async function fetchDropdownManufacturers() {
        setIsLoading(true)
        try {
            const data = await manufacturerService.getListName()
            setManufacturer(data.payload)
        } catch (error) {
            console.error('Không thể gọi danh sách nhà sản xuất:', error)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchProducts()
        fetchDropdownCategories()
        fetchDropdownManufacturers()
    }, [])

    useEffect(() => {
        if (JSON.stringify(prevFilter.current) !== JSON.stringify(filter)) {
            fetchProducts();
        }

        prevFilter.current = filter;
    }, [filter])
    return (
        <>
            <Spinner isLoading={isLoading} />
            <ProductFilterTaskbar fetchData={fetchProducts} filter={filter} setFilter={setFilter} categories={categories} manufacturer={manufacturer} />
            <div className="card mt-2">
                <ProductList products={products} />
            </div>

        </>
    )
}
