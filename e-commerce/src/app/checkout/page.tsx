import { Suspense } from "react";
import { Checkout } from "@/widgets/Checkout/Checkout";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Загрузка...
        </div>
      }
    >
      <Checkout />
    </Suspense>
  );
}
