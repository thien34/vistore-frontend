import { ProductAttributeName } from './productAttribute.interface'

export interface ProductRequest {
    id?: number | null
    name: string
    sku?: string
    gtin?: string
    fullDescription?: string
    quantity?: number
    unitPrice?: number
    productCost?: number
    weight?: number
    published?: boolean
    deleted?: boolean
    categoryId?: number
    manufacturerId?: number
    attributes?: ProductAttributeValue[];
    image?: File
}

export interface ProductAttributeValue {
    id?: number;
    productId?: number;
    value?: string;
}

export interface ProductAttribute extends ProductAttributeValue {
    name: string;
    description: string;
}

export interface ProductAttributeValueResponse {
    id: number
    value: string
    imageUrl?: string
}
export interface ProductResponse {
    id: number
    name: string
    deleted: boolean
    categoryId: number
    manufacturerId: number
    weight: number
    sku: string
    description: string
    categoryName: string
    manufacturerName: string
    imageUrl: string
    gtin: string
    largestDiscountPercentage: number
    discountPrice: number
    price: number
}

export interface ProductResponseDetails {
    id: number
    name: string
    deleted: boolean
    categoryId: number
    manufacturerId: number
    sku: string
    price: number
    quantity: number
    productCost: number
    imageUrl: string
    gtin: string
    discountPrice: number
    attributes: ProductAttributeName[]
    largestDiscountPercentage: number
    weight: number
}

export interface ProductParentRequest {
    name: string
    weight: number
    categoryId: number
    manufacturerId: number
}

export interface ProductFilter {
    name?: string
    categoryId?: number
    manufacturerId?: number
}