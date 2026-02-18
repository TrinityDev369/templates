"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  CreditCard,
  ClipboardCheck,
  CheckCircle2,
  Check,
  ArrowLeft,
  ArrowRight,
  Pencil,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation";

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Step Definitions                              */
/* -------------------------------------------------------------------------- */

const STEPS: {
  key: CheckoutStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "shipping", label: "Shipping", icon: Package },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: ClipboardCheck },
  { key: "confirmation", label: "Confirmation", icon: CheckCircle2 },
];

const STEP_INDEX: Record<CheckoutStep, number> = {
  shipping: 0,
  payment: 1,
  review: 2,
  confirmation: 3,
};

/* -------------------------------------------------------------------------- */
/*                              Validation Schemas                            */
/* -------------------------------------------------------------------------- */

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / province is required"),
  zipCode: z.string().min(1, "ZIP / postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const paymentSchema = z.object({
  nameOnCard: z.string().min(1, "Name on card is required"),
  cardNumber: z
    .string()
    .min(13, "Card number is too short")
    .max(19, "Card number is too long")
    .regex(/^[\d\s]+$/, "Card number must contain only digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z
    .string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
});

/* -------------------------------------------------------------------------- */
/*                             Placeholder Data                               */
/* -------------------------------------------------------------------------- */

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "Switzerland",
  "Austria",
  "Netherlands",
];

const PLACEHOLDER_ITEMS: OrderItem[] = [
  { id: "1", name: "Wireless Headphones", price: 79.99, quantity: 1 },
  { id: "2", name: "Phone Case - Midnight", price: 29.99, quantity: 2 },
  { id: "3", name: "USB-C Charging Cable", price: 14.99, quantity: 1 },
];

const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

/* -------------------------------------------------------------------------- */
/*                             Utility Functions                              */
/* -------------------------------------------------------------------------- */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.length < 4) return cleaned;
  return `**** **** **** ${cleaned.slice(-4)}`;
}

/* -------------------------------------------------------------------------- */
/*                           Progress Stepper                                 */
/* -------------------------------------------------------------------------- */

function ProgressStepper({ currentStep }: { currentStep: CheckoutStep }) {
  const currentIndex = STEP_INDEX[currentStep];

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted &&
                    "border-green-500 bg-green-500 text-white",
                  isActive &&
                    "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                  !isCompleted &&
                    !isActive &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs font-medium hidden sm:block",
                  isActive
                    ? "text-primary"
                    : isCompleted
                      ? "text-green-600"
                      : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-[-1.25rem] sm:mt-[-1.5rem] h-0.5 w-8 sm:w-16 md:w-20",
                  i < currentIndex
                    ? "bg-green-500"
                    : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Shipping Form                                   */
/* -------------------------------------------------------------------------- */

function ShippingStep({
  defaultValues,
  onSubmit,
}: {
  defaultValues: ShippingData | null;
  onSubmit: (data: ShippingData) => void;
}) {
  const form = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Shipping Address</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Apt 4B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input placeholder="NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP / Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="10001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg">
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Payment Form                                    */
/* -------------------------------------------------------------------------- */

function PaymentStep({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: PaymentData | null;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}) {
  const form = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultValues ?? {
      nameOnCard: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="nameOnCard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name on Card</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      {...field}
                    />
                    <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MM/YY"
                      maxLength={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            This is a demo checkout. No real payment will be processed.
          </p>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" size="lg">
              Review Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Review Step                                    */
/* -------------------------------------------------------------------------- */

function ReviewStep({
  shipping,
  payment,
  items,
  onPlaceOrder,
  onBack,
  onEditShipping,
  onEditPayment,
}: {
  shipping: ShippingData;
  payment: PaymentData;
  items: OrderItem[];
  onPlaceOrder: () => void;
  onBack: () => void;
  onEditShipping: () => void;
  onEditPayment: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Your Order</h2>

      {/* Shipping Address */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Shipping Address
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onEditShipping}
          >
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <p className="mt-1 text-sm">
          {shipping.firstName} {shipping.lastName}
          <br />
          {shipping.address}
          <br />
          {shipping.city}, {shipping.state} {shipping.zipCode}
          <br />
          {shipping.country}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {shipping.email}
        </p>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Payment Method
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onEditPayment}
          >
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{payment.nameOnCard}</span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {maskCardNumber(payment.cardNumber)}
        </p>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Order Items
        </h3>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onPlaceOrder}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Place Order
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Confirmation Step                                 */
/* -------------------------------------------------------------------------- */

function ConfirmationStep({
  orderNumber,
  email,
}: {
  orderNumber: string;
  email: string;
}) {
  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5 + Math.floor(Math.random() * 3));
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-6 py-8 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been placed
          successfully.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Number</span>
          <span className="font-mono font-semibold">{orderNumber}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Estimated Delivery
          </span>
          <span className="font-medium">{estimatedDelivery}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Confirmation Sent To
          </span>
          <span className="font-medium">{email}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Package className="h-4 w-4" />
        <span>You will receive shipping updates via email.</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button>Continue Shopping</Button>
        <Button variant="outline">View Order</Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Order Summary Sidebar                            */
/* -------------------------------------------------------------------------- */

function OrderSummary({ items }: { items: OrderItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const content = (
    <>
      {/* Item List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-muted/60 to-muted">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium leading-tight">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between text-base font-bold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{content}</CardContent>
      </Card>

      {/* Mobile collapsible */}
      <div className="lg:hidden rounded-lg border">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="text-sm font-semibold">
            Order Summary ({items.length} items)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {formatCurrency(total)}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                mobileOpen && "rotate-180"
              )}
            />
          </div>
        </button>
        {mobileOpen && (
          <div className="space-y-4 border-t px-4 pb-4 pt-3">
            {content}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Page                                     */
/* -------------------------------------------------------------------------- */

export default function ShopCheckoutPage() {
  const [currentStep, setCurrentStep] =
    useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingData | null>(
    null
  );
  const [paymentData, setPaymentData] = useState<PaymentData | null>(
    null
  );
  const [orderNumber] = useState(() => generateOrderNumber());

  const items = PLACEHOLDER_ITEMS;

  /* -- Step Handlers -- */

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (data: PaymentData) => {
    setPaymentData(data);
    setCurrentStep("review");
  };

  const handlePlaceOrder = () => {
    setCurrentStep("confirmation");
  };

  const goBack = () => {
    const order: CheckoutStep[] = [
      "shipping",
      "payment",
      "review",
      "confirmation",
    ];
    const idx = order.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(order[idx - 1]);
    }
  };

  const goToShipping = () => setCurrentStep("shipping");
  const goToPayment = () => setCurrentStep("payment");

  /* -- Render -- */

  const isConfirmation = currentStep === "confirmation";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          Checkout
        </h1>

        {/* Progress Stepper */}
        <div className="mb-8">
          <ProgressStepper currentStep={currentStep} />
        </div>

        {isConfirmation ? (
          /* Confirmation takes full width, no sidebar */
          <ConfirmationStep
            orderNumber={orderNumber}
            email={shippingData?.email ?? ""}
          />
        ) : (
          /* Two-column layout: content + order summary */
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left: Step Content */}
            <div>
              {currentStep === "shipping" && (
                <ShippingStep
                  defaultValues={shippingData}
                  onSubmit={handleShippingSubmit}
                />
              )}

              {currentStep === "payment" && (
                <PaymentStep
                  defaultValues={paymentData}
                  onSubmit={handlePaymentSubmit}
                  onBack={goBack}
                />
              )}

              {currentStep === "review" &&
                shippingData &&
                paymentData && (
                  <ReviewStep
                    shipping={shippingData}
                    payment={paymentData}
                    items={items}
                    onPlaceOrder={handlePlaceOrder}
                    onBack={goBack}
                    onEditShipping={goToShipping}
                    onEditPayment={goToPayment}
                  />
                )}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <OrderSummary items={items} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
