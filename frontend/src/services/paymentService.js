// MOCK payment service. Replace the internals when a real gateway is integrated.
const TEST_DECLINE_CARD = "4000000000000002";

export function processPayment({ planId, cycle, cardNumber }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const digits = cardNumber.replace(/\s/g, "");

      if (digits === TEST_DECLINE_CARD) {
        resolve({ status: "failed", message: "Your card was declined. Try a different card." });
        return;
      }

      resolve({
        status: "success",
        reference: `MOCK-${planId.toUpperCase()}-${cycle.toUpperCase()}-${Date.now()}`,
      });
    }, 1500);
  });
}