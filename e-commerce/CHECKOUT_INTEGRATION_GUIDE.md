/\*\*

- Integration guide for Checkout widget
-
- To integrate API calls, add the following:
-
- 1.  Import the API functions and React Query hooks:
- ```

  ```
- import { orderApi } from '@/shared/api/orderApi';
- import { paymentApi, PaymentMethod } from '@/shared/api/paymentApi';
- import { useMutation } from '@tanstack/react-query';
- import { useRouter } from 'next/navigation';
- import { toast } from 'sonner'; // If you have a toast notification system
- ```

  ```
-
- 2.  Add form state for customer info:
- ```

  ```
- const [formData, setFormData] = useState({
- fullName: '',
- phone: '',
- email: '',
- comment: '',
- couponCode: '',
- });
- const [selectedPickupPointId, setSelectedPickupPointId] = useState<string>('');
- const [selectedWindowId, setSelectedWindowId] = useState<string>('');
- ```

  ```
-
- 3.  Add mutation hooks:
- ```

  ```
- const router = useRouter();
-
- const createOrderMutation = useMutation({
- mutationFn: orderApi.initOrder,
- });
-
- const selectPickupMutation = useMutation({
- mutationFn: ({ orderId, data }: any) => orderApi.selectPickup(orderId, data),
- });
-
- const createPaymentMutation = useMutation({
- mutationFn: paymentApi.create,
- });
- ```

  ```
-
- 4.  Add submit handler:
- ```

  ```
- const handleSubmit = async () => {
- try {
-     // Validate form
-     if (!formData.fullName || !formData.phone || !formData.email) {
-       toast.error('Заполните все обязательные поля');
-       return;
-     }
-
-     if (!selectedPickupPointId || !selectedWindowId) {
-       toast.error('Выберите точку и окно самовывоза');
-       return;
-     }
-
-     // Step 1: Create order
-     const order = await createOrderMutation.mutateAsync({
-       couponCode: formData.couponCode || undefined,
-       comment: formData.comment || undefined,
-     });
-
-     // Step 2: Select pickup point and window
-     const updatedOrder = await selectPickupMutation.mutateAsync({
-       orderId: order.id,
-       data: {
-         pointId: selectedPickupPointId,
-         windowId: selectedWindowId,
-       },
-     });
-
-     // Step 3: Create payment
-     const payment = await createPaymentMutation.mutateAsync({
-       orderId: order.id,
-       paymentMethod: paymentMethod === 'cash' ? PaymentMethod.CASH : PaymentMethod.ROBOKASSA,
-     });
-
-     // Step 4: Redirect to confirmation page
-     router.push(`/order-confirmation/${order.id}`);
-
- } catch (error: any) {
-     console.error('Error creating order:', error);
-     toast.error(error?.response?.data?.message || 'Ошибка при оформлении заказа');
- }
- };
- ```

  ```
-
- 5.  Update the "Оформить заказ" button:
- ```

  ```
- <button
- onClick={handleSubmit}
- disabled={createOrderMutation.isPending || selectPickupMutation.isPending || createPaymentMutation.isPending}
- className="bg-[#131314] rounded-[12px] md:rounded-[14px] py-[12px] md:py-[14px] px-[24px] md:px-[30px] lg:px-[34px] w-full hover:bg-[#2c2c2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
- >
- <p className="font-normal text-[18px] md:text-[20px] lg:text-[22px] leading-[2.2] text-white">
-     {createOrderMutation.isPending ? 'Оформление...' : 'Оформить заказ'}
- </p>
- </button>
- ```

  ```
-
- 6.  Add input handlers for form fields (example for name):
- ```

  ```
- <input
- type="text"
- value={formData.fullName}
- onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
- placeholder="ФИО\*"
- className="border border-[rgba(19,19,20,0.16)] rounded-[12px] md:rounded-[14px] p-[16px] md:p-[20px] lg:p-[24px] w-full"
- />
- ```

  ```
-
- 7.  Integrate pickup point and window selection:
- - Replace the map iframe with an interactive component that fetches pickup points
- - Use GET /pickup-points endpoint to get available points
- - Use GET /pickup-windows endpoint with pointId and date to get available windows
- - Store selected IDs in state
-
- Note: The checkout form needs to be updated from static to controlled inputs.
- Replace all the placeholder divs with actual form inputs.
  \*/

export {};
