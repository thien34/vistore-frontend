import { CustomerOrderResponse, ReturnRequestRequest } from "@/interface/returnProduct.interface";
import { on } from "events";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { use, useEffect, useState } from "react";


interface Props {
    order: CustomerOrderResponse;
    returnRequest: ReturnRequestRequest;
    setReturnRequest: (returnRequest: ReturnRequestRequest) => void;
    disabled: boolean;
    totalCost: number;
}

const reasons = [
    'Product damaged, but shipping box OK',
    'Missing parts of accessories',
    'Both product and shipping box damaged',
    'Wrong item was sent',
    'Don’t like the product',
]

const ReturnRequestInformation = ({ totalCost, order, returnRequest, setReturnRequest, disabled }: Props) => {
    const [returnRequestRequest, setReturnRequestRequest] = useState<ReturnRequestRequest>(returnRequest);
    const [usePercent, setUsePercent] = useState(false);
    useEffect(() => {
        setReturnRequestRequest(returnRequest);
    }, [returnRequest]);

    const handleReturnRequestChange = (updatedFields: Partial<ReturnRequestRequest>) => {
        setReturnRequestRequest(prevReturnRequest => { return { ...prevReturnRequest, ...updatedFields } });
        setReturnRequest({ ...returnRequest, ...updatedFields });
    }

    const onChangeRequestAction = (check: boolean) => {
        if (check == false) {
            handleReturnRequestChange({ requestAction: 'Requesting exchange' });
        } else {
            handleReturnRequestChange({ requestAction: 'Requesting refunds' });
        }
    }
    const onChangeReturnFee = (fee: number) => {
        const returnAmount = usePercent ? fee * totalCost / 100 : fee;
        const returnRequest = { ...returnRequestRequest, returnFee: returnAmount };
        setUsePercent(false);
        setReturnRequestRequest(returnRequest);
        setReturnRequest(returnRequest);
    }
    return (
        <>
            <div className="card p-fluid">
                {order ? (
                    <label htmlFor="" className='font-bold mb-5'>
                        RETURN / {order.billCode} - {order.firstName + ' ' + order.lastName}
                    </label>
                ) : (
                    <label htmlFor="" className='font-bold mb-5'>
                        RETURN
                    </label>
                )}
                <div className="field grid mt-2">
                    <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-4 md:mb-0">
                        EXCHANGE
                    </label>
                    <div className="col-12 md:col-4">
                        <InputSwitch
                            disabled={disabled}
                            checked={returnRequestRequest.requestAction === 'Requesting refunds'}
                            onChange={(e) => onChangeRequestAction(e.value)} />
                    </div>
                </div>
                {!disabled && (
                    <div className="field grid mt-2">
                        <label htmlFor="returnFee" className="font-bold col-12 mb-2 md:col-4 md:mb-0">
                            Return Fee
                        </label>
                        <div className="col-12 md:col-4">
                            <div className="flex items-center gap-2">
                                <InputNumber
                                    id="returnFee"
                                    value={returnRequestRequest.returnFee}
                                    onValueChange={(e) => onChangeReturnFee(e.value || 0)}
                                    mode="currency"
                                    currency="USD"
                                    min={0}
                                    max={usePercent ? 100 : totalCost}
                                    disabled={disabled}
                                />
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="percentCheckbox"
                                        checked={usePercent}
                                        onChange={(e) => setUsePercent(e.target.checked)}
                                        disabled={disabled}
                                    />
                                    <label htmlFor="percentCheckbox" className="ml-2">Percentage</label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="field grid mt-2">
                    <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                        Total Quantity :
                    </label>
                    <div className="col-12 md:col-4 text-right">
                        <label className="font-bold">{returnRequest.totalReturnQuantity}</label>
                    </div>
                </div>
                <div className="field grid mt-2">
                    <label htmlFor="" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                        Total Cost
                    </label>
                    <div className="col-12 md:col-4 text-right">
                        <label className="font-bold">${totalCost}</label>
                    </div>
                </div>
                <div className="field grid mt-2">
                    <label htmlFor="" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                        Deduct return fee
                    </label>
                    <div className="col-12 md:col-4 text-right">
                        <label className="font-bold"> - ${returnRequest.returnFee}</label>
                    </div>
                </div>
                <div className="field grid mt-2">
                    <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                        Refund Customer
                    </label>
                    <div className="col-12 md:col-4 text-right">
                        <label className="font-bold">${totalCost - returnRequest.returnFee}</label>
                    </div>
                </div>
                <div className="field grid p-float-label mb-4 mt-2">
                    <InputTextarea
                        disabled={disabled}
                        id="staffNotes"
                        value={returnRequestRequest.staffNotes}
                        onChange={(e) => handleReturnRequestChange({ staffNotes: e.target.value })}
                        rows={2}
                    />
                    <label className='font-bold' htmlFor="username">Staff Notes</label>
                </div>
                <div className="field grid p-float-label mt-2 ">
                    <InputTextarea
                        disabled={disabled}
                        id="customerComments"
                        value={returnRequestRequest.customerComments}
                        onChange={(e) => handleReturnRequestChange({ customerComments: e.target.value })}
                        rows={2}
                    />
                    <label className='font-bold' htmlFor="username">Customer Comments</label>
                </div>
                <div className="field grid mt-2">
                    <label className="font-bold" htmlFor="reasonForReturn">Reason</label>
                    <Dropdown value={returnRequestRequest.reasonForReturn} onChange={(e) => handleReturnRequestChange({ reasonForReturn: e.target.value })}
                        options={reasons}
                        disabled={disabled}
                        placeholder="Choose reason return" style={{ width: '100%' }} />
                </div>
            </div>
        </>
    )
}

export default ReturnRequestInformation;