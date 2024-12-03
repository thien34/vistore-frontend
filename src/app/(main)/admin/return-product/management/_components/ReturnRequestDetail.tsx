import { ReturnItem, ReturnRequest } from "@/interface/returnProduct.interface"
import ListReturnItems from "./ListReturnItem"
import { useEffect, useState } from "react"
import returnProductService from "@/service/returnProduct.service"

const ReturnRequestDetail = ({ returnRequest }: { returnRequest: ReturnRequest }) => {
    const [selectedReturnRequest, setSelectedReturnRequest] = useState<ReturnRequest>(returnRequest);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

    const fetchReturnItems = async (returnRequestId: number) => {
        try {
            const { payload: data } = await returnProductService.getAllReturnItem(returnRequestId);
            setReturnItems(data.items);
        } catch (error) {
            console.error("Failed to fetch return items:", error);
        }
    };

    useEffect(() => {
        // Update state when returnRequest prop changes
        setSelectedReturnRequest(returnRequest);
        fetchReturnItems(returnRequest.id);
    }, [returnRequest]);

    return (
        <>
            <ListReturnItems initialData={returnItems} />
        </>
    );
};

export default ReturnRequestDetail;