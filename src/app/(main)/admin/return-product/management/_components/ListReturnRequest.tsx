'use client'
import { ReturnItem, ReturnRequest } from "@/interface/returnProduct.interface"
import returnProductService from "@/service/returnProduct.service"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Divider } from "primereact/divider"
import { Tag } from "primereact/tag"
import { useRef, useState } from "react"
import ListReturnItems from "./ListReturnItem"
import ReturnRequestDetail from "./ReturnRequestDetail"

interface ReturnRequestProps {
    initialData: ReturnRequest[]
}

const ListReturnRequests = ({ initialData }: ReturnRequestProps) => {
    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(initialData)

    const data = useRef<DataTable<ReturnRequest[]>>(null)
    const [visible, setVisible] = useState(false)
    // const fetchReturnRequests = async () => {
    //     const { payload: data } = await returnProductService.getAllReturnRequest();
    //     setReturnRequests(data.items);
    // }
    const getTagValue = (status: string): "info" | "success" | "danger" | "warning" => {
        switch (status) {
            case 'PENDING':
                return 'info';
            case 'APPROVED':
                return 'warning';
            case 'REJECTED':
                return 'danger';
            case 'EXCHANGED':
                return 'success';
            case 'REFUNDED':
                return 'success';
            case 'CLOSED':
                return 'success';
            default:
                return 'info';
        }
    }

    const actionBodyTemplate = (rowData: ReturnRequest) => {
        const header = `RETURN REQUEST  OF ORDER #${rowData.orderId}`;
        return (
            <>
                <Button label="Show" icon="pi pi-expand" onClick={() => setVisible(true)} />
                <Dialog header={header} visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <ReturnRequestDetail returnRequest={rowData} />
                </Dialog>
            </>
        )
    }

    return (
        <div className='card'>
            <DataTable
                ref={data}
                value={returnRequests}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Return Requests'
                emptyMessage='No Return Requests found.'
            >
                <Column
                    header="Customer"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column field='reasonForReturn' header='Reason' />
                <Column field='requestAction' header='Request Action' />
                <Column field='returnRequestStatusId' header='Status'
                    body={(rowData: ReturnRequest) => {
                        return (
                            <div>
                                <Tag value={rowData.returnRequestStatusId} severity={getTagValue(rowData.returnRequestStatusId)}></Tag>
                            </div>
                        )
                    }}
                />
                <Column header='Actions'
                    body={actionBodyTemplate}
                />
            </DataTable>
        </div>
    )
}
export default ListReturnRequests