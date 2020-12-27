import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import getConfig from 'next/config';

const OrderShow = ({ order, currentUser, stripeKey }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const { publicRuntimeConfig } = getConfig();
  const { processEnv } = publicRuntimeConfig;
  console.log('OrderShow.render stripeKey', stripeKey, processEnv);

  if (timeLeft < 0) {
    return <div>Order expires</div>;
  }

  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout
        token={(token) => doRequest({ token: token.id }).then(() => Router.push('/orders'))}
        amount={order.ticket.price * 100}
        email={currentUser.email}
        stripeKey={stripeKey}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async ({ ctx, client }) => {
  const { orderId } = ctx.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
  console.log('OrderShow.getInitialProps stripeKey', stripeKey);

  return { order: data.order, stripeKey };
};

export default OrderShow;
