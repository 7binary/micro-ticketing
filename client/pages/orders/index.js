const MyOrders = ({ orders }) => {
  return (
    <div>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

MyOrders.getInitialProps = async ({ ctx, client }) => {
  const { data } = await client.get('/api/orders');

  return { orders: data.orders };
};

export default MyOrders;
