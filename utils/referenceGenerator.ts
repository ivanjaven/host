export const generateBookingReference = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `HB${timestamp}${random}`.toUpperCase();
};
