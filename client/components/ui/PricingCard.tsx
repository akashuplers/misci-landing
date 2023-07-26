import { CheckIcon } from "@heroicons/react/24/outline";

interface PricingCardProps {
    plan: any,
    onClick?: any
}
export function PricingCard({ plan, onClick }: PricingCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full w-full">
        <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
        <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
        <div className="flex items-center mb-6">
          <span className="text-5xl font-semibold">{plan.price}</span>
          <span className="text-gray-500 text-sm ml-2">{plan.duration}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature :any, i:any) => (
            <li key={feature} className="flex items-center">
              <CheckIcon className="h-4 w-4 text-purple-500" />
              <span className="ml-2">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={onClick}
            className="mt-6 border-2 w-full border-purple-500 text-purple-500 rounded-lg py-2 px-4 hover:bg-purple-500 hover:text-white transition-colors duration-300"
          >
            Upgrade
          </button>
        </div>
      </div>
    );
  }
  