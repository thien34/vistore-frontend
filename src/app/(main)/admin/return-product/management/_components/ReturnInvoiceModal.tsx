import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ReturnInvoice, ReturnItem } from '@/interface/returnProduct.interface';



interface ReturnInvoiceModalProps {
    visible: boolean;
    onHide: () => void;
    returnInvoiceData: ReturnInvoice;
}

const ReturnInvoiceModal: React.FC<ReturnInvoiceModalProps> = ({ visible, onHide, returnInvoiceData }) => {
    const [returnItem, setReturnItem] = useState<ReturnItem[]>(returnInvoiceData.returnItems);
    const [visibleModal, setVisibleModal] = useState<boolean>(visible);
    useEffect(() => {
        setReturnItem(returnInvoiceData.returnItems);
        setVisibleModal(visible);
    }, [returnInvoiceData, visible]);
    
    const totalCostProduct = returnItem.reduce((total, item: ReturnItem) => {
        return total + item.refundTotal;
    }, 0);
    return (
        <Dialog
            visible={visibleModal}
            style={{ width: '50vw' }}
            onHide={onHide}
        >
            <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
                <h3 className="text-center text-xl font-bold text-gray-800">RETURN GOODS INVOICE</h3>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">STORE:</label>
                        <span className="text-gray-600">VISTORE - VN</span>
                    </div>
                    <div className="flex items-start">
                        <label className="font-medium text-gray-700 w-1/3">ADDRESS:</label>
                        <span className="text-gray-600 break-words">{`FPT POLYTECHNIC - KIEU MAI, Phuc Dien Ward, Bac Tu Liem District, Ha Noi City`}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Customer's Name:</label>
                        <span className="text-gray-600">{returnInvoiceData.firstName} {returnInvoiceData.lastName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Customer's Email:</label>
                        <span className="text-gray-600">{returnInvoiceData.customerEmail}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Order Code:</label>
                        <span className="text-indigo-600 font-bold">{`#${returnInvoiceData.billCode}`}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Total Cost Product:</label>
                        <span className="text-gray-600">{totalCostProduct}$</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Refund Fee:</label>
                        <span className="text-gray-600">{returnInvoiceData.returnFee}$</span>
                    </div>
                    <div className="flex items-center">
                        <label className="font-medium text-gray-700 w-1/3">Total Refund Amount:</label>
                        <span className="text-gray-600">{returnInvoiceData.refundAmount}$</span>
                    </div>
                </div>

                <label className="font-bold text-lg mt-2 block">List Return Products</label>

                <DataTable
                    showGridlines
                    value={returnInvoiceData.returnItems}
                    className="mt-4"
                >
                    <Column header="STT" body={(rowData) => {
                        return <span>{returnInvoiceData.returnItems.indexOf(rowData) + 1}</span>;
                    }} />
                    <Column field="productName" header="Product Name" />
                    <Column field="quantity" header="Quantity" />
                    <Column field="oldUnitPrice" header="Price" />
                    <Column field="discountAmountPerItem" header="Discount Per Item" />
                    <Column field="refundTotal" header="Total" />
                </DataTable>

                <div className="flex justify-between gap-4 mt-6">
                    <Button label="Close" icon="pi pi-times" onClick={onHide} className="flex-1" />
                    <Button label="Print" icon="pi pi-print" onClick={() => console.log('Invoice Confirmed')} className="flex-1" />
                </div>
            </div>
        </Dialog>
    );
};

export default ReturnInvoiceModal;