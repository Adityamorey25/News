import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full">
      <div className="relative w-full h-[140px] sm:h-[200px] md:h-[280px] lg:h-[340px]">
        <Image
          src="/hero-banner.png"
          alt="TopZone Marathi"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="bg-brand-red text-white text-center py-3 px-4">
        <p className="text-sm md:text-base font-medium">
          महाराष्ट्रातील सर्वात विश्वासू डिजिटल मराठी बातम्या व्यासपीठ
        </p>
      </div>
    </section>
  );
}