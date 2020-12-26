import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order expires</div>;
  }

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
  });

  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout
        token={(token) => doRequest({ token: token.id }).then(() => Router.push('/orders'))}
        amount={order.ticket.price * 100}
        email={currentUser.email}
        stripeKey={process.env.STRIPE_PUBLIC_KEY}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async ({ ctx, client }) => {
  const { orderId } = ctx.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data.order };
};

export default OrderShow;
