// // components/booking/BookingDetails.tsx
// import { useState, useRef } from "react";
// import { Room } from "@/types/room";
// import { format, differenceInDays } from "date-fns";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useReactToPrint } from "react-to-print";
// import { BookingConfirmationSlip } from "./BookingConfirmationSlip";
// import { useBookingTransaction } from "@/hooks/bookingTransaction";
// import Loading from "@/components/ui/loading";

// interface BookingDetailsProps {
//   room: Room;
//   booking: {
//     checkIn: Date;
//     checkOut: Date;
//     guests: {
//       adults: number;
//       children: number;
//       infants: number;
//     };
//     personalInfo: {
//       firstName: string;
//       lastName: string;
//       middleName: string;
//       mobileNumber: string;
//     };
//     totalPrice: number;
//   };
// }

// export function BookingDetails({ room, booking }: BookingDetailsProps) {
//   const router = useRouter();
//   const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const nights = differenceInDays(booking.checkOut, booking.checkIn);
//   const serviceFee = 1000;
//   const finalTotal = booking.totalPrice + serviceFee;

//   const {
//     createBooking,
//     isProcessing,
//     error: bookingError,
//     bookingReference,
//   } = useBookingTransaction();

//   const handlePrint = useReactToPrint({
//     content: () => contentRef.current,
//   });

//   const handleBack = () => {
//     const params = new URLSearchParams({
//       checkIn: booking.checkIn.toISOString(),
//       checkOut: booking.checkOut.toISOString(),
//       adults: booking.guests.adults.toString(),
//       children: booking.guests.children.toString(),
//       infants: booking.guests.infants.toString(),
//       firstName: booking.personalInfo.firstName,
//       lastName: booking.personalInfo.lastName,
//       middleName: booking.personalInfo.middleName,
//       mobileNumber: booking.personalInfo.mobileNumber,
//     });

//     router.push(`/booking/${room.id}?${params.toString()}`);
//   };

//   const handleConfirmBooking = async () => {
//     try {
//       await createBooking({
//         room,
//         checkIn: booking.checkIn,
//         checkOut: booking.checkOut,
//         guests: booking.guests,
//         personalInfo: booking.personalInfo,
//         totalPrice: booking.totalPrice,
//         serviceFee,
//       });

//       setIsConfirmationModalOpen(true);
//     } catch (err) {
//       console.error("Booking failed:", err);
//     }
//   };

//   // Confirmation Modal Component
//   const ConfirmationModal = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-8 h-8 text-green-500"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <h2 className="text-xl font-bold text-gray-900">
//             Booking Submitted!
//           </h2>
//           <p className="text-gray-600 mt-2">
//             Your booking reference is:{" "}
//             <span className="font-bold">{bookingReference}</span>
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             Please proceed to the front desk to complete your check-in.
//           </p>
//         </div>

//         <div className="flex justify-center mb-6">
//           <div ref={contentRef}>
//             <BookingConfirmationSlip
//               bookingReference={bookingReference}
//               checkInDate={new Date()}
//               checkOutDate={booking.checkOut}
//               roomType={room.type}
//               roomNumber={room.number}
//               lastName={booking.personalInfo.lastName}
//               numberOfGuests={booking.guests.adults + booking.guests.children}
//               bookingDate={new Date()}
//               totalAmount={finalTotal}
//             />
//           </div>
//         </div>

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={handlePrint}
//             className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
//               hover:bg-primary-dark transition-colors flex items-center gap-2"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//               />
//             </svg>
//             Print Receipt
//           </button>
//           <button
//             onClick={() => router.push("/rooms")}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium
//               hover:bg-gray-200 transition-colors"
//           >
//             Done
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//       {/* Header */}
//       <div className="relative h-48">
//         <Image
//           src={room.images.primary}
//           alt={room.name}
//           fill
//           className="object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//         <div className="absolute bottom-0 p-6">
//           <h1 className="text-2xl font-bold text-white">
//             Booking Confirmation
//           </h1>
//           <p className="text-white/90 mt-1">
//             Please review your booking details
//           </p>
//         </div>
//       </div>

//       <div className="p-6 space-y-8">
//         {/* Room Details */}
//         <div className="flex gap-6">
//           <div className="flex-1">
//             <h2 className="text-lg font-bold text-gray-900">
//               {room.type} {room.number}
//             </h2>
//             <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
//               <div className="flex items-center gap-1">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                   />
//                 </svg>
//                 <span>Floor {room.floor}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//                   />
//                 </svg>
//                 <span>{room.size}m²</span>
//               </div>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-2xl font-bold text-gray-900">
//               ₱{room.price.toLocaleString()}
//             </p>
//             <p className="text-sm text-gray-500">per night</p>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-100" />

//         {/* Stay Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Stay Details
//           </h3>
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <p className="text-sm text-gray-500">Check-in</p>
//               <p className="text-base font-medium text-gray-900">
//                 {format(booking.checkIn, "EEE, MMM d, yyyy")}
//               </p>
//               <p className="text-sm text-gray-500 mt-1">After 2:00 PM</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Check-out</p>
//               <p className="text-base font-medium text-gray-900">
//                 {format(booking.checkOut, "EEE, MMM d, yyyy")}
//               </p>
//               <p className="text-sm text-gray-500 mt-1">Before 12:00 PM</p>
//             </div>
//           </div>
//         </div>

//         {/* Guest Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Guest Details
//           </h3>
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <p className="text-sm text-gray-500">Guest Name</p>
//               <p className="text-base font-medium text-gray-900">
//                 {booking.personalInfo.firstName}{" "}
//                 {booking.personalInfo.middleName}{" "}
//                 {booking.personalInfo.lastName}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Contact Number</p>
//               <p className="text-base font-medium text-gray-900">
//                 {booking.personalInfo.mobileNumber}
//               </p>
//             </div>
//           </div>
//           <div className="mt-4">
//             <p className="text-sm text-gray-500">Number of Guests</p>
//             <div className="flex gap-4 mt-1">
//               <p className="text-sm text-gray-600">
//                 {booking.guests.adults} Adults
//               </p>
//               {booking.guests.children > 0 && (
//                 <p className="text-sm text-gray-600">
//                   {booking.guests.children} Children
//                 </p>
//               )}
//               {booking.guests.infants > 0 && (
//                 <p className="text-sm text-gray-600">
//                   {booking.guests.infants} Infants
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Price Breakdown */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Price Details
//           </h3>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <p className="text-gray-600">
//                 ₱{room.price.toLocaleString()} × {nights}{" "}
//                 {nights == 1 ? "night" : "nights"}
//               </p>
//               <p className="text-gray-900 font-medium">
//                 ₱{booking.totalPrice.toLocaleString()}
//               </p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <p className="text-gray-600">Service fee</p>
//               <p className="text-gray-900 font-medium">
//                 ₱{serviceFee.toLocaleString()}
//               </p>
//             </div>
//             <div className="pt-2 mt-2 border-t border-gray-100">
//               <div className="flex justify-between">
//                 <p className="text-base font-semibold text-gray-900">Total</p>
//                 <p className="text-lg font-bold text-gray-900">
//                   ₱{(booking.totalPrice + serviceFee).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-4 pt-4">
//           <button
//             onClick={handleBack}
//             className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium
//             hover:bg-gray-200 transition-colors"
//           >
//             Back
//           </button>
//           <button
//             onClick={handleConfirmBooking}
//             disabled={isProcessing}
//             className="flex-1 px-6 py-3 text-white bg-primary rounded-xl font-medium
//             hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed
//             flex items-center justify-center gap-2"
//           >
//             {isProcessing ? (
//               <>
//                 <Loading size="small" color="white" />
//                 Processing...
//               </>
//             ) : (
//               "Confirm Booking"
//             )}
//           </button>
//         </div>
//         {bookingError && (
//           <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
//             {bookingError}
//           </div>
//         )}

//         {/* Confirmation Modal */}
//         {isConfirmationModalOpen && <ConfirmationModal />}
//       </div>
//     </div>
//   );
// }
