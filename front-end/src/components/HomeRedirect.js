// components/HomeRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const admin = localStorage.getItem("admin");

    if (admin) {
      navigate("/admin/dashboard");
    } else if (user) {
      navigate("/reserver");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default HomeRedirect;
