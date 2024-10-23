'use client'

import React, { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { useRouter } from 'next/navigation'
import ManagerPath from '@/constants/ManagerPath'
import { CustomerRoles } from '@/interface/CustomerRoles'
export default function Page() {
    const [roles, setRoles] = useState<CustomerRoles[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/admin/customer-roles?pageNo=1')
                const result = await response.json()
                setRoles(result.data.items)
            } finally {
                setLoading(false)
            }
        }
        fetchRoles()
    }, [])

    const header = (
        <div className='flex flex-wrap align-items-center justify-content-between gap-2'>
        <span className='text-xl text-900 font-bold'>Customer Roles</span>
        <Button 
            label='Add' 
            icon='pi pi-plus' 
            className='p-button-success' 
            onClick={() => router.push(ManagerPath.CUSTOMER_ROLE_ADD)}
        />
    </div>
    )
    const actionBodyTemplate = (roles: CustomerRoles) => {
        return <Button label='Edit' icon='pi pi-pencil' onClick={() => router.push(ManagerPath.CUSTOMER_ROLE_UPDATE.replace(':id', roles.id.toString()))} />
        
    }

    return (
        <>
            <DataTable value={roles} header={header} loading={loading}>
                <Column field='name' header='Name' />
                <Column field='active' header='Active' body={(data) => (data.active ? '✔' : '✘')} />
                <Column header='Actions' body={actionBodyTemplate} style={{ width: '20%' }} />
            </DataTable>
        </>
    )
}
