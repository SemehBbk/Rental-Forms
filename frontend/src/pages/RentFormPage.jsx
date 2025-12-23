import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const RentFormPage = () => {
    const { token } = useParams();
    const [formInfo, setFormInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cin: "",
        address: "",
    });

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const { data } = await api.get(`/forms/public/${token}`);
                setFormInfo(data.data);
            } catch (err) {
                setError(err.response?.data?.message || "Invalid Link");
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/forms/public/${token}`, formData);
            setSubmitted(true);
            toast.success("Form submitted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>;
    if (submitted) return (
        <div className="flex flex-col justify-center items-center h-screen bg-green-50">
            <h1 className="text-4xl text-green-600 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-700">Your information has been received.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Rental Form</h1>
                    <p className="text-gray-500 mt-2">
                        Completing rental for <span className="font-semibold text-blue-600">{formInfo.houseName}</span> - <span className="font-semibold text-blue-600">{formInfo.roomName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input required type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input required type="email" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input required type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CIN / ID Number</label>
                            <input required type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.cin} onChange={e => setFormData({ ...formData, cin: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                        <textarea required rows="3" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200">
                        Submit Rental Information
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentFormPage;
