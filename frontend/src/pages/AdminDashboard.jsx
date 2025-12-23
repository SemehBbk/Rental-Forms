import { useEffect, useState } from "react";
import api from "../lib/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [houses, setHouses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHouse, setNewHouse] = useState({ name: "", address: "" });

    const fetchHouses = async () => {
        try {
            const { data } = await api.get("/houses");
            setHouses(data.data.houses);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, []);

    const handleCreateHouse = async (e) => {
        e.preventDefault();
        try {
            await api.post("/houses", newHouse);
            setNewHouse({ name: "", address: "" });
            setIsModalOpen(false);
            fetchHouses();
        } catch (err) {
            alert("Error creating house");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="space-x-4">
                    <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        + New House
                    </button>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {houses.map((house) => (
                    <div key={house._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{house.name}</h2>
                        <p className="text-gray-500 mb-4">{house.address}</p>
                        <div className="flex justify-between items-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {house.rooms.length} Rooms
                            </span>
                            <Link to={`/admin/house/${house._id}`} className="text-blue-600 hover:underline font-medium">
                                Manage Rooms &rarr;
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add New House</h2>
                        <form onSubmit={handleCreateHouse} className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="House Name"
                                value={newHouse.name}
                                onChange={(e) => setNewHouse({ ...newHouse, name: e.target.value })}
                                required
                            />
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Address"
                                value={newHouse.address}
                                onChange={(e) => setNewHouse({ ...newHouse, address: e.target.value })}
                                required
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
