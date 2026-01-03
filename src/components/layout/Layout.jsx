import React from 'react';
import Header from './header/Header';
import Footer from './footer/Footer';
import Ecology from './ecology/Ecology';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Ecology />
      <Footer />
    </>
  );
};

export default Layout;
