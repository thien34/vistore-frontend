'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import ManagerPath from '@/constants/ManagerPath';

const CustomerRoleAdd: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [active, setActive] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const router = useRouter();

    const handleAdd = async () => {
        const newRole = { name, active };

        setIsAdding(true);
        try {
            await fetch('http://localhost:8080/api/admin/customer-roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRole),
            });

            alert('Added successfully!');
            router.push(ManagerPath.CUSTOMER_ROLE);
        } catch (error) {
            console.error('Error adding role:', error);
            alert('Failed to add role. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="p-fluid p-formgrid p-grid" style={{ maxWidth: '600px', margin: 'auto', paddingTop: '2em' }}>
            <h1>Thêm vai trò mới</h1>
            <div className="p-field p-col-12">
                <label htmlFor="name">Tên vai trò</label>
                <InputText 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="p-inputtext-lg mt-3" 
                    style={{ width: '100%', marginBottom: '1em' }} 
                />
                <div className="p-field-checkbox">
                    <Checkbox 
                        inputId="active" 
                        checked={active} 
                        onChange={e => setActive(e.checked)} 
                    />
                    <label htmlFor="active" style={{ marginLeft: '0.5em' }}>Active</label>
                </div>
                <Button 
                    label="Add" 
                    onClick={handleAdd} 
                    loading={isAdding} 
                    className="p-button-success" 
                    style={{ marginTop: '1.5em', width: '100%' }} 
                />
            </div>
        </div>
    );
};

export default CustomerRoleAdd;
