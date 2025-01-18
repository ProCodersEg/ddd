import { Ad } from "@/types/ads";

interface AdStatusBadgeProps {
  status: Ad['status'];
}

export function AdStatusBadge({ status }: AdStatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status}
    </span>
  );
}