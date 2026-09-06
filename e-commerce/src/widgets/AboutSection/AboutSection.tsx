import Image from "next/image";

interface AboutFeature {
  text: string;
}

const features: AboutFeature[] = [
  {
    text: "Эксклюзивные новинки раньше, чем у конкурентов — всегда в наличии и по выгодной цене.",
  },
  {
    text: "Гарантированная подлинность всей техники и официальная поддержка сервисных центров.",
  },
  {
    text: "Возможность рассрочки и персональные условия для каждого клиента.",
  },
];

export const AboutSection = () => {
  return (
    <section className="w-full py-[40px] md:py-[50px] lg:py-[55px] xl:py-[60px]">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-[30px] md:gap-[50px] lg:gap-[70px] xl:gap-[100px] items-start">
          <div className="flex flex-col gap-[20px] md:gap-[25px] lg:gap-[32px] xl:gap-[40px]">
            <h2 className="font-medium text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] bg-gradient-to-r from-[#131314] to-[#ef6f2e] bg-clip-text text-transparent">
              Prime Electronics — ваш надежный проводник в мире современных
              технологий.
            </h2>
            <div className="font-normal text-[16px] md:text-[16px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px] leading-[1.3] text-[rgba(19,19,20,0.4)] flex flex-col gap-[16px]">
              <p>
                Мы предлагаем только премиальную электронику от ведущих мировых
                брендов: новейшие смартфоны, планшеты и аксессуары с официальной
                гарантией. Наши эксперты помогут подобрать идеальное устройство
                под любые потребности и бюджет.
              </p>
              <p>
                Покупая в Prime Electronics, вы выбираете качество, уверенность
                и высокий уровень сервиса. У нас всегда актуальные модели,
                индивидуальный подход к каждому клиенту, быстрая доставка и
                программа лояльности для постоянных покупателей.
              </p>
            </div>
          </div>
          <Image
            src="/images/prime_banner.png"
            alt="Prime Electronics"
            width={973}
            height={444}
            className="hidden lg:block rounded-[20px] w-full h-auto"
          />
          <Image
            src="/images/banner_mob.png"
            alt="Prime Electronics"
            width={343}
            height={156}
            className="lg:hidden rounded-[20px] w-full h-auto"
          />
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-[15px] lg:gap-[25px] xl:gap-[40px] mt-[30px] md:mt-[35px] lg:mt-[45px] xl:mt-[60px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#f5f5f7] rounded-[20px] p-[20px] md:p-[22px] lg:p-[24px] flex flex-col gap-[20px] md:gap-[25px] lg:gap-[30px]"
            >
              <div className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] lg:w-[34px] lg:h-[34px]">
                <Image
                  src="/icons/check.svg"
                  alt="Check"
                  width={34}
                  height={34}
                  className="w-full h-full"
                />
              </div>
              <p className="font-normal text-[16px] md:text-[16px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px] leading-[1.3] text-[#131314]">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
     
      </div>
    </section>
  );
};
