import { useEffect } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

function Page() {
  const {doRequest} = useRequest({url: '/api/users/signout'});

  useEffect(() => {
    doRequest().then(() => Router.push('/'));
  }, []);

  return (
    <div>You are signing out...</div>
  );
}

export default Page;
