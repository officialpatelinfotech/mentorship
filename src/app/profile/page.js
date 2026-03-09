import Profile from "@/components/Profile";
import { Suspense } from "react";

export const metadata = {
    title: "My Profile | MBA Mentorship",
    description: "View your personal dashboard and bookings.",
};

export default function Page() {
    return (
        <Suspense fallback={<div className="profile-loading"></div>}>
            <Profile />
        </Suspense>
    );
}
