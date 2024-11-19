"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Hotel Logo"
              width={120}
              height={40}
              className="h-8 md:h-10 w-auto"
            />
            <h2 className="mx-3 text-md font-bold text-gray-200">HoST</h2>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen">
        <Image
          src="/images/landing/main.jpg"
          alt="Hotel View"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-black/20 flex items-center px-6 md:px-24 py-16"
        >
          <div className="text-white max-w-2xl">
            <h1 className="text-6xl md:text-6xl font-semibold leading-tight mb-6">
              Unwind in a<br />
              Dreamy
              <br />
              Seaside Haven
            </h1>
            <p className="text-sm md:text-base font-light opacity-90">
              Indulge in a stunning views and wonderful experience as
              <br />
              you discover the breathtaking beauty of our hotel
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-16 md:mb-24 text-gray-800">
            Exclusive Premium Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-base md:text-lg font-light mt-4 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Exciting Features */}
      <section className="py-24 md:py-16 bg-[#f8f8f8]">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-2xl font-bold text-center mb-16 md:mb-24 text-gray-800">
            Other Exciting Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {/* First Column - Single Large Square Image */}
            <div className="md:col-span-1">
              <div className="aspect-square relative w-full overflow-hidden rounded-2xl">
                <Image
                  src={otherFeatures[0].image}
                  alt={otherFeatures[0].title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-base font-light text-gray-800">
                  {otherFeatures[0].title}
                </h3>
                <p className="text-xs text-gray-500">
                  {otherFeatures[0].description}
                </p>
              </div>
            </div>

            {/* Circular Images Grid */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
                {otherFeatures.slice(1).map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 relative overflow-hidden rounded-full mb-3">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-600 max-w-[120px]">
                      {feature.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Book Now Button */}
      <motion.button
        onClick={() => router.push("/rooms")}
        className="fixed bottom-8 md:bottom-12 right-8 md:right-12 z-50 px-6 md:px-8 py-3 md:py-4
    bg-black/90 text-white text-xs md:text-sm rounded-full shadow-xl backdrop-blur-sm
    hover:bg-black transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        Book Now
      </motion.button>
    </div>
  );
}

// Features array remains the same
const features = [
  {
    title: "Nature-Inspired Pool",
    description: "Serene Swimming Pool with a Touch of Paradise",
    image: "/images/landing/image4.jpg",
  },
  {
    title: "Integrated Tourist Area",
    description: "Tourism integration is enhancing travel experiences",
    image: "/images/landing/image3.jpg",
  },
  {
    title: "Window Sunset",
    description: "From the Room, Witness the Beauty of the World",
    image: "/images/landing/image2.jpg",
  },
];

// Other Features array remains the same
const otherFeatures = [
  {
    title: "Integrated Tourist Area",
    description: "Tourism integration is enhancing travel experiences",
    image: "/images/landing/tourist.jpg",
  },
  {
    title: "Private Terrace or Balcony",
    image: "/images/landing/balcony.jpg",
  },
  {
    title: "Living Room and Dining Area",
    image: "/images/landing/dining.jpg",
  },
  {
    title: "Small Kitchenette",
    image: "/images/landing/kitchen.jpg",
  },
  {
    title: "Direct Beach Access",
    image: "/images/landing/beach.jpg",
  },
  {
    title: "Free Wi-Fi",
    image: "/images/landing/wifi.jpg",
  },
  {
    title: "Housekeeping Services",
    image: "/images/landing/housekeeping.jpg",
  },
];
