'use client'

import { ReturnInvoice } from "@/interface/returnProduct.interface"
import Link from "next/link";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

interface Props {
    returnInvoices: ReturnInvoice[]
}
const ReturnInvoicesList = ({ returnInvoices }: Props) => {
    const customerName = (rowData: ReturnInvoice) => {
        return rowData.firstName + ' ' + rowData.lastName
    }
    const totalReturn = (rowData: ReturnInvoice) => {
        return rowData.returnItems.map((item) => item.quantity).reduce((a, b) => a + b, 0);
    }

    const refundAmount = (rowData: ReturnInvoice) => {
        return rowData.refundAmount.toFixed(2) + '$';
    }
    const actionBodyTemplate = () => {
        return (
            <>
                <Link href="/admin/return-product/management/return-invoice/detail">
                    <Button icon="pi pi-external-link" />
                </Link>
            </>
        )
    }
    return (
        <div className="card">
            <DataTable removableSort value={returnInvoices} paginator rows={10} rowsPerPageOptions={[10, 20, 50]}>
                <Column body={(_, { rowIndex }) => rowIndex + 1} header='#' />
                <Column sortable align='center' field="billCode" header="Bill Code" />
                <Column align='center' body={customerName} header="Customer" />
                <Column align='center' field="customerEmail" header="Email" />
                <Column align='center' body={refundAmount} header="Refund Amount" />
                <Column align='center' body={totalReturn} header="Total Return" />
                <Column sortable align='center' header="Date" />
                <Column align='center' body={actionBodyTemplate} header="Action" />
            </DataTable>
        </div>
    );
}

export default ReturnInvoicesList;