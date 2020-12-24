import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
  });
  const purchase = () => {
    doRequest()
      .then(({ data }) => Router.push('/orders/[orderId]', `/orders/${data.order.id}`));
  };

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={purchase} className="btn btn-primary">Purchase</button>
    </div>
  );
};

TicketShow.getInitialProps = async ({ ctx, client }) => {
  const { ticketId } = ctx.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data.ticket };
};

export default TicketShow;
