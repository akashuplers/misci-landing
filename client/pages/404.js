import React from 'react';

const NotFoundPage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-blue-700">
            <div className="text-white text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-2xl">{`Oops! The page you're looking for doesn't exist.`}</p>
                <p className="mt-4">Please check the URL or go back to the homepage.</p>
                <button
                    className="bg-white text-blue-700 rounded-full px-6 py-2 mt-6 hover:bg-blue-800 hover:text-white"
                    onClick={() => window.location.href = '/'}
                >
                    Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
