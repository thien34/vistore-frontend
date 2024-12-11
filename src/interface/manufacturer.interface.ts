import { PagingRequest, PagingResponse } from './paging.interface'

export interface Manufacturer {
    id?: number
    name: string
    description: string
}

export interface ManufacturerName {
    id: number
    manufacturerName: string
}

export type ManufacturerPagingResponse = PagingResponse<Manufacturer>

export interface ManufacturerSearch extends PagingRequest {
    name?: string
}
