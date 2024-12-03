'use client'
import { ReturnRequest } from "@/interface/returnProduct.interface";
import Link from "next/link";
import { Button } from "primereact/button";
import { useState } from "react";
import { useMountEffect } from 'primereact/hooks'
import returnProductService from "@/service/returnProduct.service";
import ReturnRequestList from "./_component/ReturnRequestList";
const ReturnRequestManage = () => {
    const [returnRequest, setReturnRequest] = useState<ReturnRequest[]>([]);
    useMountEffect(() => {
        returnProductService.getAllReturnRequest().then((response) => {
            setReturnRequest(response.payload.items)
        });
    });
    return (
        <>
            <div className="card">
                <div className='flex justify-between items-center'>
                    <h2 className=''>Return Request</h2>
                    <Link href='/admin/return-product/management/return-request/add'>
                        <Button icon='pi pi-plus' label='Create Return Request' />
                    </Link>
                </div>
            </div>
            <div className="card">
                <ReturnRequestList returnRequest={returnRequest} />
            </div>
        </>
    )
}

export default ReturnRequestManage;