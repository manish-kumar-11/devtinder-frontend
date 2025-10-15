import { useDispatch } from "react-redux";
import { addFeed } from "./utils/feedSlice";
import { useEffect } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "./utils/constants";
//import { useState } from 'react';
const Feed = () => {
  
  const feed = useSelector((store) => store.feed);
  console.log(feed,"feddddddd")
  const dispatch = useDispatch();

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      console.log("ress",res)
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      //TODO: handle error
      console.log(err)
    }
  };

  useEffect(() => {
    getFeed();
  }, []);
  return (
    feed && (
      <div className="flex justify-center my-10">
        <UserCard user={feed[0]} />
      </div>
    )
  );
};

export default Feed