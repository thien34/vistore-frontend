import { ReturnRequest } from "@/interface/returnProduct.interface";
import Link from "next/link";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";

interface Props {
    returnRequest: ReturnRequest[]
}

const ReturnRequestList = ({ returnRequest }: Props) => {
    const customerName = (rowData: ReturnRequest) => {
        return rowData.firstName + ' ' + rowData.lastName
    }
    const requestAction = (rowData: ReturnRequest) => {
        if (rowData.requestAction === 'Requesting exchange') {
            return 'Exchange'
        } else return 'Refund'
    }
    const status = (rowData: ReturnRequest) => {
        return (
            <div>
                <Tag value={rowData.returnRequestStatusId} severity={colorStatus(rowData.returnRequestStatusId)} ></Tag>
            </div>

        )
    }
    const colorStatus = (status: string): 'info' | 'success' | 'warning' | 'danger' | undefined => {
        switch (status) {
            case 'RETURN_REQUESTED':
                return 'info';
            case 'RETURN_AUTHORIZED':
                return 'success';
            case 'PENDING_SHIPMENT':
            case 'SHIPPED_BY_CUSTOMER':
                return 'info';
            case 'RECEIVED_BY_STORE':
                return 'success';
            case 'PROCESSING':
                return 'warning';
            case 'REFUND_APPROVED':
                return 'success';
            case 'REFUND_REJECTED':
                return 'danger';
            case 'RETURN_COMPLETED':
                return 'success';
            default:
                return 'info';
        }
    };
    const actionBodyTemplate = () => {
        return (
            <>
                <Link href="/admin/return-product/management/return-request/detail">
                    <Button icon="pi pi-external-link" />
                </Link>
            </>
        )
    }
    return (
        <DataTable removableSort value={returnRequest} paginator rows={10} rowsPerPageOptions={[10, 20, 50]}>
            <Column body={(_, { rowIndex }) => rowIndex + 1} header='#' />
            <Column align='center' body={customerName} header="Customer" />
            <Column align='center' field="reasonForReturn" header="Reason" />
            <Column align='center' body={requestAction} header="Request Action" />
            <Column align='center' field="totalReturnQuantity" header="Quantity" />
            <Column align='center' body={status} header="Status" />
            <Column sortable align='center' header="Date" />
            <Column align='center' body={actionBodyTemplate} header="Action" />
        </DataTable>
    );
}

export default ReturnRequestList;
