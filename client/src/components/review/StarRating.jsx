import { Star } from 'lucide-react';

export default function StarRating({ rating, onChange, size = 20, readonly = false }) {
    const stars = [1, 2, 3, 4, 5];

    if (readonly) {
        return (
            <div className="flex gap-0.5">
                {stars.map(s => (
                    <Star
                        key={s}
                        size={size}
                        className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            {stars.map(s => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange && onChange(s)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
}
