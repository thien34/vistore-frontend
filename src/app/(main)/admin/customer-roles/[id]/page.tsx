'use client';
import { CustomerRoles } from '@/interface/CustomerRoles';
import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import ManagerPath from '@/constants/ManagerPath';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

interface Params { id: number; }
interface CustomerRoleDetailProps { params: Params; }

const CustomerRoleDetail: React.FC<CustomerRoleDetailProps> = ({ params }) => {
    const { id } = params;
    const [role, setRole] = useState<CustomerRoles | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch(`http://localhost:8080/api/admin/customer-roles/${id}`)
            .then(res => res.json())
            .then(result => { setRole(result.data); setLoading(false); })
            .catch(err => { console.error('Error:', err); setLoading(false); });
    }, [id]);

    const handleChange = (key: string, value: any) => setRole(role ? { ...role, [key]: value } : role);

    const handleUpdate = async () => {
        if (role) {
            setIsUpdating(true);
            try {
                await fetch(`http://localhost:8080/api/admin/customer-roles/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(role)
                });
                router.push(ManagerPath.CUSTOMER_ROLE);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleDelete = async () => {
        if (confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
            setIsDeleting(true);
            try {
                await fetch(`http://localhost:8080/api/admin/customer-roles/${id}`, {
                    method: 'DELETE',
                });
                alert('Vai trò đã được xóa thành công!');
                router.push(ManagerPath.CUSTOMER_ROLE);
            } catch (error) {
                console.error('Error deleting role:', error);
                alert('Lỗi khi xóa vai trò, vui lòng thử lại.');
            } finally {
                setIsDeleting(false);
            }
        }
    };
    const handleCancel = () => {
        router.push(ManagerPath.CUSTOMER_ROLE);
    };
    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-fluid p-formgrid p-grid" style={{ maxWidth: '600px', margin: 'auto', paddingTop: '2em' }}>
            {role ? (
                <div className="p-field p-col-12">
                    <label htmlFor="name">Tên vai trò</label>
                    <InputText 
                        id="name" 
                        value={role.name} 
                        onChange={e => handleChange('name', e.target.value)} 
                        className="p-inputtext-lg mt-3" 
                        style={{ width: '100%', marginBottom: '1em' }}
                    />
                    <div className="p-field-checkbox">
                        <Checkbox 
                            inputId="active" 
                            checked={role.active} 
                            onChange={e => handleChange('active', e.target.checked)} 
                        />
                        <label htmlFor="active" style={{ marginLeft: '0.5em' }}>Active</label>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5em' }}>
                        <Button 
                            label="Update" 
                            onClick={handleUpdate} 
                            loading={isUpdating} 
                            className="p-button-primary" 
                            style={{ width: '23%' }}
                        />
                        <Button 
                            label="Delete" 
                            onClick={handleDelete} 
                            loading={isDeleting} 
                            className="p-button-danger" 
                            style={{ width: '23%' }}
                        />
                        <Button 
                            label="Cancel" 
                            onClick={handleCancel} 
                            className="p-button-secondary" 
                            style={{ width: '23%' }}
                        />
                    </div>
                </div>
            ) : (
                <p className="p-col-12">Không tìm thấy vai trò.</p>
            )}
        </div>
    );
};

export default CustomerRoleDetail;
