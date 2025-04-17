import React from 'react';
import Layout from '../components/layout/Layout';
import CVGrader from '../components/CV/CVGrader';
import { withSessionPage } from '../lib/session';

const CVGraderPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <CVGrader />
      </div>
    </Layout>
  );
};

export const getServerSideProps = withSessionPage(async function ({ req, res }) {
  const user = req.session.get('user');
  
  if (!user) {
    return {
      redirect: {
        destination: '/auth/login?callback=/cv-grader',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
});

export default CVGraderPage; 