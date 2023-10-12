import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const BottomTabBar = () => {
    const router = useRouter();
    console.log(router);
    console.log("Router from bototm nav");
    const [selectedRoute, setSelectedRoute] = useState(router.pathname);
    useEffect(() => {
        console.log("Router from bototm nav");
        setSelectedRoute(router.pathname);
    }, [router.pathname]);

    return (
        <Tab.Group>
            {/* bottom tab */}
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 fixed bottom-0 inset-x-0 mb-2 z-10 backdrop-filter backdrop-blur-lg bg-opacity-30">
                {(categories).map((category) => (
                    <TabItem
                        key={category.name}
                        category={category}
                        selected={selectedRoute === category.path}
                    />
                ))}
            </Tab.List>
        </Tab.Group>
    );
};

const TabItem = ({ category, selected }) => {
    const tabClass = `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected
        ? "bg-white shadow"
        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
        }`;

    return (
        <Tab key={category} className={tabClass}>
            <Link href={category.path}
                className="flex flex-col items-center justify-center space-y-1"
            >
                <span className="w-5 h-5">{category.icon}</span>
                <span className="text-xs">{category.name}</span>
            </Link>
        </Tab>
    );
};
// Source Tab 
export default BottomTabBar;

export var categories = [
    {
        path: "/published",
        name: "Published",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
            </svg>
        ),
    },
    {
        path: "/",
        name: "Generate",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
    {
        path: "/saved",
        name: "Saved",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                />
            </svg>
        ),
    }
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
