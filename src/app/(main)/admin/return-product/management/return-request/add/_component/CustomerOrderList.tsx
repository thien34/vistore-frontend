'use client'
import { CustomerOrderResponse } from "@/interface/returnProduct.interface";
import { Button } from "primereact/button";
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
interface Props {
    initialData: CustomerOrderResponse[];
    setOrderId: (orderId: number) => void;
    handleNext: () => void;
    setCustomerOrder: (order: CustomerOrderResponse) => void;
}
const CustomerOrderList = ({ initialData, setOrderId, handleNext, setCustomerOrder }: Props) => {
    function convertDateToFormat(dateStr: string) {
        const dateObj = new Date(dateStr);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    const setOrderIdAndNext = (rowData: CustomerOrderResponse) => {
        setOrderId(rowData.orderId);
        setCustomerOrder(rowData);
        handleNext();
    }
    const select = (rowData: CustomerOrderResponse) => {
        return (
            <Button label="Select" icon="pi pi-verified" onClick={() => setOrderIdAndNext(rowData)} />
        )
    }
    return (
        <DataTable
            value={initialData}
            dataKey='orderId'
            removableSort
            resizableColumns
            showGridlines
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
            currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Orders'
            emptyMessage='No Orders found.'

        >
            <Column body={(_, { rowIndex }) => rowIndex + 1} header='#' />
            <Column field='billCode' header='CODE' />
            <Column
                header='Date'
                field="orderDate"
                sortable
                body={(rowData) => convertDateToFormat(rowData.orderDate)}
            />
            <Column
                header="Customer"
                body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
            />
            <Column
                field="orderTotal"
                body={(rowData) => `${rowData.orderTotal}$`}
                header="Total" />
            <Column header="Action" body={select} />
        </DataTable>
    )
}

export default CustomerOrderList;