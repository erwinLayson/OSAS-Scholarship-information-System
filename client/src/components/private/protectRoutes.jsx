import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import API from "../../API/fetchAPI";

export default function ProtectedRoutes ({ elements, url }) {
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get(`/${url}/verify`);
                if (res.data.success) {
                    setLogin(true);
                } else {
                    setLogin(false);
                }
            } catch (err) {
                console.log(err);
                setLogin(false);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-800">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return !login ? <Navigate to={'/login'} /> : elements;
}