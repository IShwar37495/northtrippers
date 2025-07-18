import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function CreatePackage() {
    const [photos, setPhotos] = useState<File[]>([]);
    const [hotelIncluded, setHotelIncluded] = useState(false);
    const [mealIncluded, setMealIncluded] = useState(false);
    const [mealTimes, setMealTimes] = useState('one');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5);
            setPhotos(files);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Head title="Create Package" />
            <h1 className="text-2xl font-bold mb-6">Create a New Package</h1>
            <form>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Package Name</label>
                    <input type="text" className="w-full border rounded p-2" name="name" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Photos (max 5)</label>
                    <input type="file" className="w-full" name="photos" accept="image/*" multiple onChange={handlePhotoChange} />
                    <div className="text-xs text-gray-500 mt-1">{photos.length} selected</div>
                </div>
                <div className="mb-4 flex gap-4">
                    <div>
                        <label className="block mb-1 font-medium">Min Days</label>
                        <input type="number" className="w-full border rounded p-2" name="min_days" min={1} required />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Max Days</label>
                        <input type="number" className="w-full border rounded p-2" name="max_days" min={1} required />
                    </div>
                </div>
                <div className="mb-4 flex gap-4">
                    <div>
                        <label className="block mb-1 font-medium">Min Persons</label>
                        <input type="number" className="w-full border rounded p-2" name="min_persons" min={1} required />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Max Persons</label>
                        <input type="number" className="w-full border rounded p-2" name="max_persons" min={1} required />
                    </div>
                </div>
                <div className="mb-4 flex gap-4">
                    <div>
                        <label className="block mb-1 font-medium">Min Age</label>
                        <input type="number" className="w-full border rounded p-2" name="min_age" min={0} required />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Max Age</label>
                        <input type="number" className="w-full border rounded p-2" name="max_age" min={0} required />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Available Vehicles</label>
                    <input type="text" className="w-full border rounded p-2" name="vehicles" placeholder="Comma separated (e.g. Car, Bus, Van)" />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Pickup Locations</label>
                    <input type="text" className="w-full border rounded p-2" name="pickup_locations" placeholder="Comma separated" />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Boarding Location</label>
                    <input type="text" className="w-full border rounded p-2" name="boarding_location" />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Hotel Included?</label>
                    <input type="checkbox" className="ml-2" checked={hotelIncluded} onChange={e => setHotelIncluded(e.target.checked)} />
                </div>
                {hotelIncluded && (
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Hotel Links (one per line)</label>
                        <textarea className="w-full border rounded p-2" name="hotel_links" placeholder="https://hotel.com\nhttps://oyorooms.com" rows={2}></textarea>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Meal Included?</label>
                    <input type="checkbox" className="ml-2" checked={mealIncluded} onChange={e => setMealIncluded(e.target.checked)} />
                </div>
                {mealIncluded && (
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Meal Times</label>
                        <select className="w-full border rounded p-2" name="meal_times" value={mealTimes} onChange={e => setMealTimes(e.target.value)}>
                            <option value="one">One Time</option>
                            <option value="two">Two Times</option>
                        </select>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Travel Points Covered</label>
                    <textarea className="w-full border rounded p-2" name="travel_points" placeholder="List travel points, one per line" rows={3}></textarea>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Package</button>
            </form>
        </div>
    );
}
