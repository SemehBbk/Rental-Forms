import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import FileSaver from "file-saver";

const HouseDetails = () => {
    const { id } = useParams();
    const [house, setHouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newRoom, setNewRoom] = useState({ name: "", price: 0 });

    const fetchHouse = async () => {
        try {
            const { data } = await api.get(`/houses/${id}`);
            setHouse(data.data.house);
        } catch (err) {
            toast.error("Failed to load house");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouse();
    }, [id]);

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post("/rooms", { houseId: id, ...newRoom });
            setNewRoom({ name: "", price: 0 });
            fetchHouse();
            toast.success("Room added");
        } catch (err) {
            toast.error("Failed to add room");
        }
    };

    const generateLink = async (roomId) => {
        try {
            const { data } = await api.post(`/rooms/${roomId}/generate`);
            // Copy to clipboard
            navigator.clipboard.writeText(data.data.link);
            toast.success("Link generated & copied to clipboard!");
            fetchHouse();
        } catch (err) {
            toast.error("Generation failed");
        }
    };

    const resetRoom = async (roomId) => {
        if (!window.confirm("Are you sure? This will make the room available and expire any active forms.")) return;
        try {
            await api.patch(`/rooms/${roomId}/reset`);
            toast.success("Room reset");
            fetchHouse();
        } catch (err) {
            toast.error("Reset failed");
        }
    }

    const downloadCSV = async (formId) => {
        try {
            const response = await api.get(`/forms/download/${formId}`, { responseType: 'blob' });
            FileSaver.saveAs(response.data, `form_${formId}.csv`);
        } catch (err) {
            toast.error("Download failed");
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!house) return <div>House not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Link to="/admin" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{house.name}</h1>
                    <p className="text-gray-500">{house.address}</p>
                </div>
            </div>

            {/* Add Room Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-lg font-semibold mb-3">Add Room</h3>
                <form onSubmit={handleAddRoom} className="flex gap-4">
                    <input placeholder="Room Name (e.g. Room 101)" className="border p-2 rounded flex-1"
                        value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} required />
                    <input placeholder="Price" type="number" className="border p-2 rounded w-32"
                        value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: Number(e.target.value) })} />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                </form>
            </div>

            {/* Rooms List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Room Name</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                            <th className="p-4 font-semibold text-gray-600">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {house.rooms.map(room => (
                            <tr key={room._id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{room.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                ${room.status === 'Available' ? 'bg-green-100 text-green-800' :
                                            room.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    <button onClick={() => generateLink(room._id)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        {room.status === 'Available' ? 'Generate Link' : 'Regenerate Link'}
                                    </button>

                                    {/* Action to Copy Existing Link if Pending */}
                                    {room.status === 'Pending' && room.currentForm && (
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/rent/${room.currentForm.token}`;
                                                navigator.clipboard.writeText(link);
                                                toast.success("Existing link copied!");
                                            }}
                                            className="text-green-600 hover:text-green-800 font-medium text-sm ml-4"
                                        >
                                            Copy Link
                                        </button>
                                    )}

                                    {room.status !== 'Available' && (
                                        <button onClick={() => resetRoom(room._id)} className="text-red-500 hover:text-red-700 font-medium text-sm ml-4">
                                            Release / Reset
                                        </button>
                                    )}
                                </td>
                                <td className="p-4">
                                    {room.status === 'Rented' && (
                                        <button onClick={() => downloadCSV(room.history[room.history.length - 1])}
                                            className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-black transition">
                                            Download CSV
                                        </button>
                                    )}
                                    {room.status === 'Pending' && <span className="text-gray-400 text-sm italic">Waiting for form...</span>}
                                    {room.status === 'Available' && <span className="text-gray-400 text-sm">-</span>}
                                </td>
                            </tr>
                        ))}
                        {house.rooms.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">No rooms yet. Add one above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HouseDetails;
