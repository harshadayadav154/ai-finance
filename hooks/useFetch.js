import { useState } from "react";
import { toast } from "sonner";

const useFetch = (callbackFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await callbackFunc(...args);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return { data, loading, error, fn, setData };
};

export default useFetch;
