'use client'
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Steps } from 'primereact/steps';
import { useCallback, useEffect, useState } from 'react';
import CustomerOrderList from './CustomerOrderList';
import { CustomerOrderResponse, ReturnItemRequest, ReturnRequestRequest } from '@/interface/returnProduct.interface';
import { useMountEffect } from 'primereact/hooks';
import returnProductService from '@/service/returnProduct.service';
import { OrderItemsResponse } from '@/interface/orderItem.interface';
import OrderService from '@/service/order.service';
import OrderItemList from './OrderItemList';
import ReturnRequestInformation from './ReturnRequestInformation';
import { useRouter } from 'next/router';

interface ProductAttribute {
    productAttribute: {
        name: string
    }
    id: number
    name: string
    value: string
}

interface Product {
    id: number
    name: string
    unitPrice: number
    discountPrice?: number
    quantity: number
    attributes: ProductAttribute[] | null
    largestDiscountPercentage: number
    cartUUID: string
    imageUrl: string
    idOderItem: number
}

const defaultReturnRequest: ReturnRequestRequest = {
    customerId: 0,
    orderId: 0,
    reasonForReturn: '',
    requestAction: 'Requesting exchange',
    totalReturnQuantity: 0,
    customerComments: '',
    staffNotes: '',
    returnFee: 0,
    returnRequestStatusId: 'RETURN_REQUESTED',
}

const ReturnRequestForm = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [orderId, setOrderId] = useState<number>(-1);
    const [returnItems, setReturnItems] = useState<ReturnItemRequest[]>([])
    const [customerOrder, setCustomerOrder] = useState<CustomerOrderResponse>(
        {
            orderId: 0,
            billCode: '',
            customerId: 0,
            orderDate: '',
            firstName: '',
            lastName: '',
            orderTotal: 0,
        }
    )
    const [returnRequest, setReturnRequest] = useState<ReturnRequestRequest>(defaultReturnRequest);
    const [orderItemsResponse, setOrderItemsResponse] = useState<OrderItemsResponse[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const handleNext = () => {
        if (activeIndex < cardContent.length - 1) {
            setActiveIndex(activeIndex + 1);
        }
    };

    useEffect(() => {
        setReturnRequest({
            ...returnRequest,
            totalReturnQuantity: updateTotalReturnQuantity
        });
    }, [returnItems]);

    const updateTotalReturnQuantity = returnItems.reduce((acc, item) => {
        return acc + (item.quantity || 0);
    }, 0);
    const totalCost = returnItems.reduce((acc, item) => {
        return acc + (item.refundTotal || 0);
    }, 0);
    const handlePrevious = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };
    const preventNext = () => {
        if (activeIndex === cardContent.length - 1) {
            return true;
        }
        if (activeIndex == 0 && orderId === -1) {
            return true;
        }
        return false;
    }

    const preventSubmit = () => {
        if (returnItems.length === 0) {
            return true;
        }
        if (returnRequest.reasonForReturn === '') {
            return true;
        }
        return false;
    }
    const handleSubmit = () => {
        handleReturn();
    }
    const handleReturn = async () => {
        try {
            const returnResponse = await returnProductService.createReturnRequest(returnRequest);
            if (returnResponse.status !== 200) {
                throw new Error('Failed to create return request');
            }
            const returnResponsePayload = returnResponse.payload as { id: number, orderId: number };

            if (!returnResponsePayload || !returnResponsePayload.id || !returnResponsePayload.orderId) {
                throw new Error('Create return request failed: returnRequest or id not found');
            }
            const returnRequestId = returnResponsePayload.id;
            const returnItemResponse = await returnProductService.createReturnItem(returnItems, returnRequestId);
            if (returnItemResponse.status !== 200 || returnResponse.status !== 200) {
                throw new Error('Failed to create return item');
            }
        } catch (error) {
            throw new Error('Failed to create return request');
        }
    }

    const cardContent = [
        <CardStep1 setCustomerOrder={setCustomerOrder} setOrderId={setOrderId} handleNext={handleNext} />,
        <CardStep2 ReturnItems={returnItems} setOrderItems={setOrderItemsResponse} orderId={orderId} handleNext={handleNext} setReturnItems={setReturnItems} />,
        <CardStep3 totalCost={totalCost} order={customerOrder} returnRequest={returnRequest} setReturnRequest={setReturnRequest} handleNext={handleNext} />,
        <CardStep4 totalCost={totalCost} order={customerOrder} returnRequest={returnRequest} ReturnItems={returnItems} setReturnItems={setReturnItems} orderItem={orderItemsResponse} handleNext={handleNext} />
    ];
    return (
        <div className="card-container">
            <Steps model={items} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={preventNext()} />
            <div className="flex justify-between gap-4 mt-4 mx-5">
                <Button label="Back" onClick={handlePrevious} disabled={activeIndex === 0} className="btn-back" />
                {activeIndex === 3 ? (
                    <Button
                        label="Submit"
                        onClick={handleSubmit}
                        disabled={preventSubmit()}
                        className="btn-next"
                    />
                ) : (
                    <Button
                        label="Next"
                        onClick={handleNext}
                        disabled={preventNext()}
                        className="btn-next"
                    />
                )}
            </div>
            <div className="card-wrapper  h-[75vh] overflow-y-auto">
                <div className="card-content p-1 ">
                    <Card title={`${items[activeIndex].description}`} className="card">
                        {cardContent[activeIndex]}
                    </Card>
                </div>
            </div>
        </div>
    );
}
export default ReturnRequestForm;
const items = [
    { label: 'Choose Order', description: 'Choose Order to Return' },
    { label: 'Enter Quantity', description: 'Enter Quantity to Return' },
    { label: 'Fill Information', description: 'Fill Information to Return' },
    { label: 'Review & Submit', description: 'Review & Submit Return Request' }
];
const CardStep1 = ({ setOrderId, handleNext, setCustomerOrder }: {
    setOrderId: (orderId: number) => void, handleNext: () => void,
    setCustomerOrder: React.Dispatch<React.SetStateAction<CustomerOrderResponse>>
}) => {
    const [customerOrderList, setCustomerOrderList] = useState<CustomerOrderResponse[]>([]);
    useMountEffect(() => {
        returnProductService.getAllOrder().then((response) => {
            setCustomerOrderList(response.payload.items)
        });
    });
    return (
        <CustomerOrderList setCustomerOrder={setCustomerOrder} handleNext={handleNext} setOrderId={setOrderId} initialData={customerOrderList} />
    )
}
const CardStep2 = ({ orderId, handleNext, ReturnItems, setReturnItems, setOrderItems }: {
    orderId: number, handleNext: () => void,
    setReturnItems: React.Dispatch<React.SetStateAction<ReturnItemRequest[]>>
    setOrderItems: React.Dispatch<React.SetStateAction<OrderItemsResponse[]>>
    ReturnItems: ReturnItemRequest[]
}) => {
    const [orderItem, setOrderItem] = useState<OrderItemsResponse[]>([]);
    const fetchData = useCallback(async () => {
        try {
            const orderResponse = await OrderService.getOrderItems(orderId.toString());
            if (orderResponse && orderResponse.payload) {
                setOrderItem(orderResponse.payload);
                setOrderItems(orderResponse.payload);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [orderId]);
    useEffect(() => {
        if (orderId !== -1) {
            fetchData();
        }
    }, [orderId, fetchData]);
    return (
        <>
            <OrderItemList ReturnItems={ReturnItems} isEditable={true} initialOrderItems={orderItem} setReturnItems={setReturnItems} />
        </>
    )
}
const CardStep3 = ({ order, totalCost, returnRequest, handleNext, setReturnRequest }: {
    order: CustomerOrderResponse, returnRequest: ReturnRequestRequest,
    handleNext: () => void,
    setReturnRequest: (request: ReturnRequestRequest) => void
    totalCost: number,
}) => {
    return (
        <>
            <ReturnRequestInformation totalCost={totalCost} disabled={false} order={order} returnRequest={returnRequest} setReturnRequest={setReturnRequest} />
        </>
    )
}
const CardStep4 = ({ handleNext, totalCost, order, returnRequest, setReturnItems, ReturnItems, orderItem }: {
    handleNext: () => void,
    setReturnItems: React.Dispatch<React.SetStateAction<ReturnItemRequest[]>>
    ReturnItems: ReturnItemRequest[],
    orderItem: OrderItemsResponse[],
    order: CustomerOrderResponse,
    returnRequest: ReturnRequestRequest,
    totalCost: number,
}) => {
    return (
        <>
            <div className="card p-6 shadow-lg rounded-lg bg-white flex w-full max-w-7xl mx-auto">
                <div className="flex flex-col w-2/3 flex-grow">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Product</h2>
                    <OrderItemList
                        ReturnItems={ReturnItems}
                        isEditable={false}
                        initialOrderItems={orderItem}
                        setReturnItems={setReturnItems}
                    />
                </div>
                <div className="flex flex-col w-1/3 ml-1 flex-grow">
                    <ReturnRequestInformation disabled={true} totalCost={totalCost} order={order} returnRequest={returnRequest} setReturnRequest={() => { }} />
                </div>
            </div>
        </>
    )
}