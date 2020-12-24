import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const CreateTicketPage = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
  });

  const onSubmit = (event) => {
    event.preventDefault();
    doRequest().then(() => Router.push('/'));
  };

  const onBlurPrice = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(`${value.toFixed(2)}`);
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlurPrice}
            onChange={e => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </div>
  );
};

CreateTicketPage.getInitialProps = async ({ currentUser, client }) => {
  console.log('currentUser @ index', currentUser);
  return { currentUser };
};

export default CreateTicketPage;
