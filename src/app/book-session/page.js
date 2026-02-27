import React from "react";
import BookSession from "../../components/BookSession";

const Page = () => {
    return (
        <React.Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
            <BookSession />
        </React.Suspense>
    );
};

export default Page;
