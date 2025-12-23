import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {children}
        </div>
    );
};

export default Layout;
