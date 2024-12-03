'use client'
import ReturnRequestForm from "./_component/ReturnRequestForm";

const ReturnRequestCreate = () => {
    return (
        <>
            <div className="card">
                <div className='flex justify-between items-center'>
                    <h4 className=''>Create Return Request</h4>
                </div>
                <ReturnRequestForm />
            </div>
        </>
    )
}

export default ReturnRequestCreate;