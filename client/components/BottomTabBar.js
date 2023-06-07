import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const BottomTabBar = () => {
    const router = useRouter();
    console.log(router);
    console.log('Router from bototm nav');
    const [selectedRoute, setSelectedRoute] = useState(router.pathname);
    useEffect(() => {
        console.log('Router from bototm nav');
        setSelectedRoute(router.pathname);
    }, [router.pathname]);


    return (
        <Tab.Group>
            {/* bottom tab */}
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 fixed bottom-0 inset-x-0 mb-2 z-10 backdrop-filter backdrop-blur-lg bg-opacity-30">
                {Object.keys(categories).map((category) => (
                    <TabItem
                        key={category}
                        category={category}
                        selected={selectedRoute === categories[category]}
                    />
                ))}
            </Tab.List>
        </Tab.Group>
    );
};
// Tab component for rendering individual tabs
const TabItem = ({ category, selected }) => {
    const tabClass = `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
        }`;

    return (
        <Tab
            key={category}
            className={tabClass}
        >
            <Link href={categories[category]}>{category}</Link>
        </Tab>
    );
};
export default BottomTabBar;

export var categories = {
    PublishBlog: "/published",
    GenerateBlog: "/",
    SaveBlog: "/saved",
};

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
