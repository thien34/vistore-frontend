'use client'

import type { ReturnInvoice } from "@/interface/returnProduct.interface";
import returnProductService from "@/service/returnProduct.service";
import { useState } from "react";
import { useMountEffect } from 'primereact/hooks'
import ReturnInvoicesList from "./_component/ReturnInvoicesList";
import Link from "next/link";
import { Button } from "primereact/button";
const ReturnInvoice = () => {
    const [returnInvoice, setReturnInvoice] = useState<ReturnInvoice[]>([]);
    useMountEffect(() => {
        returnProductService.getAllReturnInvoice().then((response) => {
            setReturnInvoice(response.payload.items)
        })
    })
    return (
        <>
            <div className="card">
                <div className='flex justify-between items-center'>
                    <h2 className=''>Return Invoice</h2>
                    <Link href={'#'}>
                        <Button icon='pi pi-plus' label='Create Return Invoice' />
                    </Link>
                </div>
            </div>
            <div className="card">
                <ReturnInvoicesList returnInvoices={returnInvoice} />
            </div>
        </>

    );
}

export default ReturnInvoice;