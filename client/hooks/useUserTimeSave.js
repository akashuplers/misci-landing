import { useState, useEffect } from 'react';
import {getTimeObject} from '../helpers/helper';
import { API_BASE_PATH, API_ROUTES } from '../constants/apiEndpoints';
const useUserTimeSave = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const fetchData = async () => {
    const URL = API_BASE_PATH + API_ROUTES.GET_SAVED_TIME
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
      try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const jsonData = await response.json();
        console.log(jsonData);
        const improvedData = {
            Day: getTimeObject(jsonData.data.oneDaySavedTime),
            Week: getTimeObject(jsonData.data.oneWeekSavedTime),
            Month: getTimeObject(jsonData.data.oneMonthSavedTime)
          };
          console.log('IMRPOVED DATA', improvedData)
        setData(improvedData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchData();
    setRefresh(prev => prev + 1);
  }, [refresh]);
  useEffect(() => {
    console.log('DATA', data)
  }, [data]);
  
  const handleManualRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  return { userTimeSave : data, loading, error, handleManualRefresh };
};

export default useUserTimeSave;
