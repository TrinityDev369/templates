"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number is required"),
  expiry: z.string().min(5, "Expiry is required"),
  cvv: z.string().min(3, "CVV is required"),
  cardName: z.string().min(2, "Name on card is required"),
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

const steps = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ShoppingBag },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
              currentStep > step.id
                ? "border-primary bg-primary text-primary-foreground"
                : currentStep === step.id
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground/50"
            )}
          >
            {currentStep > step.id ? (
              <Check className="h-5 w-5" />
            ) : (
              step.id
            )}
          </div>
          <span
            className={cn(
              "hidden text-sm font-medium sm:inline",
              currentStep >= step.id
                ? "text-foreground"
                : "text-muted-foreground/50"
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-px w-8 sm:w-16",
                currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({ total, shipping, tax, orderTotal }: {
  total: number;
  shipping: number;
  tax: number;
  orderTotal: number;
}) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(orderTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const { items, total, clearCart } = useCart();

  const shipping = total >= 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const shippingForm = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: "", address: "", city: "", state: "", zip: "", country: "" },
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: "", expiry: "", cvv: "", cardName: "" },
  });

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setStep(2);
  };

  const handlePaymentSubmit = (data: PaymentData) => {
    setPaymentData(data);
    setStep(3);
  };

  const handlePlaceOrder = () => {
    clearCart();
    toast.success("Order placed successfully!");
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h1 className="mb-2 text-2xl font-bold">No items to checkout</h1>
        <p className="mb-6 text-muted-foreground">Add some products to your cart first.</p>
        <Link href="/shop">
          <Button size="lg">Go to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={step} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...shippingForm.register("name")} placeholder="John Doe" />
                    {shippingForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{shippingForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...shippingForm.register("address")} placeholder="123 Main St" />
                    {shippingForm.formState.errors.address && (
                      <p className="text-sm text-destructive">{shippingForm.formState.errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...shippingForm.register("city")} placeholder="San Francisco" />
                      {shippingForm.formState.errors.city && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...shippingForm.register("state")} placeholder="CA" />
                      {shippingForm.formState.errors.state && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" {...shippingForm.register("zip")} placeholder="94102" />
                      {shippingForm.formState.errors.zip && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.zip.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...shippingForm.register("country")} placeholder="United States" />
                      {shippingForm.formState.errors.country && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/shop/cart">
                    <Button variant="outline">Back to Cart</Button>
                  </Link>
                  <Button type="submit">Continue to Payment</Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" {...paymentForm.register("cardName")} placeholder="John Doe" />
                    {paymentForm.formState.errors.cardName && (
                      <p className="text-sm text-destructive">{paymentForm.formState.errors.cardName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" {...paymentForm.register("cardNumber")} placeholder="4242 4242 4242 4242" />
                    {paymentForm.formState.errors.cardNumber && (
                      <p className="text-sm text-destructive">{paymentForm.formState.errors.cardNumber.message}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" {...paymentForm.register("expiry")} placeholder="MM/YY" />
                      {paymentForm.formState.errors.expiry && (
                        <p className="text-sm text-destructive">{paymentForm.formState.errors.expiry.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" {...paymentForm.register("cvv")} placeholder="123" />
                      {paymentForm.formState.errors.cvv && (
                        <p className="text-sm text-destructive">{paymentForm.formState.errors.cvv.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is a demo. No real payment processing occurs.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Review Order</Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping summary */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Shipping Address</h3>
                    {shippingData && (
                      <div className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{shippingData.name}</p>
                        <p>{shippingData.address}</p>
                        <p>{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
                        <p>{shippingData.country}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment summary */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Payment Method</h3>
                    {paymentData && (
                      <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Card ending in {paymentData.cardNumber.slice(-4)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Items */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Items</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} x{item.quantity}
                            {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
                          </span>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button size="lg" onClick={handlePlaceOrder}>
                    Place Order - {formatCurrency(orderTotal)}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>

        {/* Persistent order summary sidebar */}
        <div>
          <OrderSummary total={total} shipping={shipping} tax={tax} orderTotal={orderTotal} />
        </div>
      </div>
    </div>
  );
}
