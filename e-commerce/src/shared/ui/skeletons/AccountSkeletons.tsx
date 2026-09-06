export const AccountPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="flex-1 flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-[24px] flex-1">
            <div className="flex flex-col gap-[14px]">
              <div className="h-[18px] w-[120px] bg-gray-200 rounded" />
              <div className="h-[34px] w-[300px] bg-gray-200 rounded" />
            </div>
            <div className="flex gap-[10px]">
              <div className="h-[42px] w-[200px] bg-gray-200 rounded-[8px]" />
              <div className="h-[42px] w-[150px] bg-gray-200 rounded-[8px]" />
            </div>
          </div>
          <div className="flex flex-col gap-[24px] items-end">
            <div className="h-[76px] w-[162px] bg-gray-200 rounded-[10px]" />
            <div className="h-[60px] w-[160px] bg-gray-200 rounded-[12px]" />
          </div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="flex flex-col sm:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[200px] bg-white border border-[rgba(19,19,20,0.16)] rounded-[20px] p-[24px]"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="h-[34px] w-[34px] bg-gray-200 rounded" />
              <div className="flex flex-col gap-[4px]">
                <div className="h-[28px] w-[150px] bg-gray-200 rounded" />
                <div className="h-[24px] w-[100px] bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const OrdersPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Orders Table Skeleton */}
    <div className="flex-1">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
        <div className="flex flex-col gap-[16px]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[80px] bg-gray-100 rounded-[12px] p-[20px]"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-[8px]">
                  <div className="h-[20px] w-[120px] bg-gray-200 rounded" />
                  <div className="h-[16px] w-[80px] bg-gray-200 rounded" />
                </div>
                <div className="h-[24px] w-[100px] bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const FavoritesPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Favorites Grid Skeleton */}
    <div className="flex-1">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="h-[36px] w-[200px] bg-gray-200 rounded mb-[24px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-[12px] md:gap-[14px] lg:gap-[15px] xl:gap-[18px] 2xl:gap-[20px]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] p-[20px]">
              <div className="aspect-square bg-gray-200 rounded-[12px] mb-[16px]" />
              <div className="flex flex-col gap-[8px]">
                <div className="h-[20px] bg-gray-200 rounded w-3/4" />
                <div className="h-[20px] bg-gray-200 rounded w-1/2" />
                <div className="h-[28px] bg-gray-200 rounded w-1/3 mt-[8px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const PersonalDataPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Forms Skeleton */}
    <div className="flex-1 flex flex-col gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
      <div className="flex flex-col md:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px]">
        {/* Contact Data Skeleton */}
        <div className="flex-1 bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
          <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
          <div className="flex flex-col gap-[20px]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-[8px]">
                <div className="h-[16px] w-[80px] bg-gray-200 rounded" />
                <div className="h-[48px] bg-gray-200 rounded-[12px]" />
              </div>
            ))}
            <div className="h-[48px] bg-gray-200 rounded-[12px] mt-[12px]" />
          </div>
        </div>

        {/* Delivery Address Skeleton */}
        <div className="flex-1 bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
          <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
          <div className="flex flex-col gap-[20px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
            ))}
            <div className="h-[48px] bg-gray-200 rounded-[12px] mt-[12px]" />
          </div>
        </div>
      </div>

      {/* Password Change Skeleton */}
      <div className="md:max-w-[calc(50%-10px)] bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
        <div className="flex flex-col gap-[20px]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex flex-col gap-[8px]">
              <div className="h-[16px] w-[80px] bg-gray-200 rounded" />
              <div className="h-[48px] bg-gray-200 rounded-[12px]" />
            </div>
          ))}
          <div className="h-[48px] bg-gray-200 rounded-[12px] mt-[12px]" />
        </div>
      </div>
    </div>
  </div>
);

export const SubscriptionsPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Subscriptions Content Skeleton */}
    <div className="flex-1">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="h-[36px] w-[180px] bg-gray-200 rounded mb-[24px]" />
        <div className="flex flex-col gap-[20px]">
          <div className="h-[120px] bg-gray-100 rounded-[12px]" />
          <div className="h-[120px] bg-gray-100 rounded-[12px]" />
        </div>
      </div>
    </div>
  </div>
);

export const LoyaltyPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[18px] lg:gap-[20px] xl:gap-[24px] 2xl:gap-[30px] animate-pulse">
    {/* Sidebar Skeleton */}
    <div className="lg:w-[280px] xl:w-[320px] 2xl:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="flex flex-col gap-[12px]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-[48px] bg-gray-200 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>

    {/* Loyalty Content Skeleton */}
    <div className="flex-1">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] p-[24px]">
        <div className="h-[36px] w-[220px] bg-gray-200 rounded mb-[24px]" />
        <div className="flex flex-col gap-[24px]">
          <div className="h-[150px] bg-gradient-to-r from-gray-200 to-gray-300 rounded-[16px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[100px] bg-gray-100 rounded-[12px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
