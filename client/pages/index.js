import React from 'react';
import Link from 'next/link';

function LangingPage({ currentUser, tickets }) {
  const ticketList = tickets.map(ticket => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Tickets</h2>
        <Link href="/tickets/create">
          <a className="btn btn-primary">Add</a>
        </Link>
      </div>

      <table className="table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Link</th>
        </tr>
        </thead>
        <tbody>
        {ticketList}
        </tbody>
      </table>
    </div>
  );
};

LangingPage.getInitialProps = async ({ client }) => {
  const { data: { tickets } } = await client.get('/api/tickets');

  return { tickets };
};

export default LangingPage;
