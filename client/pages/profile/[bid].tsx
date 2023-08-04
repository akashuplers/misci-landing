import { useEffect, useState } from "react";
import React from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { meeAPI } from "../../graphql/querys/mee";
import LoaderPlane from "../../components/LoaderPlane";
import { useUserDataStore } from '../../store/appState';

export default function ProfilePage() {
  const router = useRouter();
  const { bid } = router.query;
  const [profileData, setProfileData] = useState<any>(null);
  const { fetchUserData, loading :userLoading, userData } = useUserDataStore();
  
  var getToken: string | null = null;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  const { data, loading, error } = useQuery(meeAPI, {
    variables: { userName: bid },
    skip: !bid,
    onCompleted: (data) => {
      setProfileData(data?.me);
    },
  });

  useEffect(() => {
    if (getToken) {
      fetchUserData(getToken);
    }
  }, [fetchUserData, getToken])

  if (loading || userLoading) return <LoaderPlane />;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Profile Page for {profileData?.name}</h1>
      <p>{profileData?.email}</p>
      {/* Display more user data here */}
    </div>
  );
}