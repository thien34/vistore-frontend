import { DataTable } from "primereact/datatable";
import { ReturnItemProps } from "./ListReturnItem";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { OrderItemInfoResponse, ReturnItem, ReturnItemRequest, ReturnRequestRequest } from "@/interface/returnProduct.interface";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";
import { FileUpload } from "primereact/fileupload";
interface ReturnProductProps {
    initialData: OrderItemInfoResponse[];
    onSelectedOrderItems: (items: OrderItemInfoResponse[], orderId: number) => void;
    submitReturnRequest: (returnItems: ReturnItemRequest[], returnRequest: ReturnRequestRequest) => void;
    orderId: number;
    customerId: number;
}


interface UploadedImage {
    productId: number;
    imageUrl: string;
}

const reasons = [
    'Product damaged, but shipping box OK',
    'Missing parts of accessories',
    'Both product and shipping box damaged',
    'Wrong item was sent',
]
const returnActionOptions = [
    { label: 'REFUND', value: 'Requesting refund' },
    { label: 'EXCHANGE', value: 'Requesting exchange' },
];
const ModalReturnProduct: React.FC<ReturnProductProps> = ({ initialData, onSelectedOrderItems, submitReturnRequest, orderId, customerId }) => {
    const [returnItems, setReturnItems] = useState<ReturnItemRequest[]>([])
    const [firstUpload, setFirstUpload] = useState(true);
    const [uploadedImages, setUploadedImages] = useState<{ [key: number]: string }>({});
    const [mappedData, setMappedData] = useState<ReturnItemRequest[]>(initialData.map((item) => ({
        returnRequestId: undefined,
        orderItemId: item.orderItemId ?? 0,
        productId: item.productId ?? null,
        quantity: item.quantity,
        oldUnitPrice: item.productPrice,
        discountAmountPerItem: item.discountAmount / item.quantity,
        refundTotal: item.quantity * (item.productPrice - item.discountAmount),
    })));

    const [returnRequest, setReturnRequest] = useState<ReturnRequestRequest>({
        customerId: customerId,
        orderId: orderId,
        reasonForReturn: '',
        requestAction: '',
        totalReturnQuantity: 0,
        customerComments: '',
        staffNotes: '',
        returnFee: 0,
        returnRequestStatusId: 'CLOSED'
    });
    const handleQuantityChange = (productId: number, quantity: number) => {
        setMappedData((prevMappedData) => {
            return prevMappedData.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity,
                        refundTotal: quantity * (item.oldUnitPrice - item.discountAmountPerItem)
                    }
                    : item
            );
        });
    };
    // useEffect(() => {
    //     if (firstUpload) {
    //         console.log("Cleaning up localStorage on component mount");
    //         localStorage.removeItem('productImages');
    //         setImages([]);
    //         setFirstUpload(false);
    //     }
    // }, []);

    const handleReturnRequestChange = (updatedFields: Partial<ReturnRequestRequest>) => {
        setReturnRequest(prevReturnRequest => { return { ...prevReturnRequest, ...updatedFields } });
    }

    const [images, setImages] = useState<UploadedImage[]>(() => {
        const storedImages = JSON.parse(localStorage.getItem('productImages') || '[]');
        return storedImages;
    });

    const handleImageChange = (files: File[], productId: number) => {
        if (files.length > 0) {
            const imageUrl = URL.createObjectURL(files[0]);
            const newImage = {
                productId,
                imageUrl,
            };
            const updatedImages = [...images, newImage];
            setImages(updatedImages);
            setUploadedImages((prevState) => ({
                ...prevState,
                [productId]: imageUrl,
            }));
            localStorage.setItem('productImages', JSON.stringify(updatedImages));
        }
    };
    const handleUploadImage = (ReturnItem: ReturnItem[]) => {
        console.log('Submitting images');
        localStorage.removeItem('productImages');
        setImages([]);
    };

    const bodyQuantity = (rowData: OrderItemInfoResponse) => {
        const currentValue = mappedData.find((u) => u.productId === rowData.productId)?.quantity ?? rowData.quantity;
        return (
            <>
                <div style={{ width: '40px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <InputNumber
                        value={currentValue}
                        onValueChange={(e) => handleQuantityChange(rowData.productId, e.value != null && e.value > rowData.quantity ? rowData.quantity : e.value ?? 0)}
                        style={{ width: '20px' }}
                    />
                    <span >{`/ ${rowData.quantity}`}</span>
                </div>
            </>
        )
    }
    const totalRefund = mappedData.reduce((total, item) => {
        return total + (item.quantity * (item.oldUnitPrice - item.discountAmountPerItem));
    }, 0);
    const bodyReturn = (returnRequest: ReturnRequestRequest) => {
        return (
            <>
                <div className="flex items-center gap-5 mt-4" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label className="w-auto  font-bold" htmlFor="requestAction">Request Action</label>
                    <SelectButton
                        id="requestAction"
                        value={returnRequest.requestAction}
                        onChange={(e) => handleReturnRequestChange({ requestAction: e.value })}
                        options={returnActionOptions}
                        style={{ display: 'flex', gap: '10px' }}
                    />
                </div>
                <div className="flex gap-5 mt-4">
                    <div className="flex-1 flex flex-col">
                        <label className="font-bold" htmlFor="staffNotes">Staff Notes</label>
                        <InputTextarea
                            id="staffNotes"
                            value={returnRequest.staffNotes}
                            onChange={(e) => handleReturnRequestChange({ staffNotes: e.target.value })}
                            rows={5}
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="font-bold" htmlFor="customerComments">Customer Comments</label>
                        <InputTextarea
                            id="customerComments"
                            value={returnRequest.customerComments}
                            onChange={(e) => handleReturnRequestChange({ customerComments: e.target.value })}
                            rows={5}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-10 mt-4">
                    <label className="font-bold" htmlFor="reasonForReturn">Reason</label>
                    <Dropdown value={returnRequest.reasonForReturn} onChange={(e) => handleReturnRequestChange({ reasonForReturn: e.value })}
                        options={reasons}
                        placeholder="Choose reason return" style={{ width: '100%' }} />
                </div>

                <div className="flex items-center gap-10 mt-4 mb-4">
                    <label className="font-bold" htmlFor="reasonForReturn">Total Refund:</label>
                    <label className="">${totalRefund}</label>
                </div>
            </>
        )
    }
    const bodyImage = (rowData: OrderItemInfoResponse) => {
        return (
            <>
                {uploadedImages[rowData.productId] ? (
                    <img src={uploadedImages[rowData.productId]} alt="product_thumbnail" />
                ) : (
                    <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" customUpload uploadHandler={(e) => { handleImageChange(e.files, rowData.productId); console.log("Upload Handle") }} />
                )}
            </>
        )
    }
    return (
        <>
            <DataTable
                value={initialData}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
            >
                <Column field="productName" header="Name" />
                <Column header="Quantity"
                    body={bodyQuantity} />
                <Column field="productPrice" header="Price" />
                <Column header="Discount Per Item" body={(rowData: OrderItemInfoResponse) =>
                (
                    <div>
                        ${rowData.discountAmount / rowData.quantity}
                    </div>
                )
                } />
                <Column header="Actual Image"
                    body={bodyImage} />
            </DataTable>
            <div > {bodyReturn(returnRequest)}</div>
            <Button label="Return" onClick={() => submitReturnRequest(mappedData, returnRequest)} />
        </>
    )
}
export default ModalReturnProduct;
