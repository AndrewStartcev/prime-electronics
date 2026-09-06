import { Basket } from "@/widgets";
import { ProductGrid } from "@/widgets";

export default function BasketPage() {
  return (
    <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px] 3xl:py-[60px] pb-[80px] md:pb-[20px] lg:pb-[30px] xl:pb-[40px] 2xl:pb-[50px] 3xl:pb-[60px]">
      <Basket />
      <div className="mt-[60px] md:mt-[80px] lg:mt-[100px] xl:mt-[120px] 2xl:mt-[140px] 3xl:mt-[160px] -mx-[16px] md:-mx-[24px] lg:-mx-[40px] xl:-mx-[120px] 2xl:-mx-[140px] 3xl:-mx-[180px]">
        <ProductGrid title="Вам может понравиться" showAllLink="/categories" />
      </div>
    </main>
  );
}
