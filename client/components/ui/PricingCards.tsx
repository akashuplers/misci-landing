import { MonthlyPlans } from "@/store/appContants";
import { PricingCard } from "./PricingCard";

export function PricingCards() {
    return (
      <div className="flex flex-wrap w-full gap-3 mt-5">
        {MonthlyPlans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    );
  }