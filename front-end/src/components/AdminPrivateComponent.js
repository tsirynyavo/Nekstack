// AdminPrivateComponent.js
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateComponent = () => {
    const admin = localStorage.getItem('admin');
    return admin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminPrivateComponent;