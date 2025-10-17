// ...existing code...
import { useDispatch } from "react-redux";
import { BASE_URL } from "./utils/constants";
import axios from "axios";
import { removeUserFromFeed } from "./utils/feedSlice";
import { useLocation } from "react-router-dom";
// ...existing code...
import { useState, useRef, useEffect } from "react";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();
  const location = useLocation();

  // Check if the current route includes '/profile'
  const isProfilePage = location.pathname.includes("/profile");

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      console.log(res);
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Swipe logic ---
  const [posX, setPosX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef(null);
  const THRESHOLD = 120;

  useEffect(() => {
    // reset position if user prop changes (new card)
    setPosX(0);
    setIsDragging(false);
  }, [user?._id]);

  const onPointerDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    // capture pointer for consistent move events
    if (cardRef.current && e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch(err) {
        console.log(err)

      }
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    setPosX(currentX - startXRef.current);
  };

  const finishSwipe = (finalX) => {
    if (finalX > THRESHOLD) {
      // interested (right)
      setPosX(window.innerWidth); // slide out
      setTimeout(() => handleSendRequest("interested", _id), 200);
    } else if (finalX < -THRESHOLD) {
      // ignored (left)
      setPosX(-window.innerWidth); // slide out
      setTimeout(() => handleSendRequest("ignored", _id), 200);
    } else {
      // reset
      setPosX(0);
    }
    setIsDragging(false);
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX) ?? startXRef.current;
    finishSwipe(endX - startXRef.current);
  };

  // Buttons fallback for click actions
  const onClickIgnore = () => handleSendRequest("ignored", _id);
  const onClickInterested = () => handleSendRequest("interested", _id);

  // --- Render ---
  return (
    <div
      ref={cardRef}
      className="card bg-base-300 w-96 shadow-xl select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      style={{
        transform: `translateX(${posX}px) rotate(${posX / 20}deg)`,
        transition: isDragging ? "none" : "transform 200ms ease",
      }}
    >
      <figure>
        <img src={photoUrl} alt="photo" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{firstName + " " + lastName}</h2>
        {age && gender && <p>{age + ", " + gender}</p>}
        <p>{about}</p>

        {/* overlay labels */}
        <div className="absolute inset-0 pointer-events-none flex items-start justify-between p-4">
          <div
            className="badge badge-error opacity-0"
            style={{
              opacity: posX < -30 ? Math.min(1, Math.abs(posX) / THRESHOLD) : 0,
            }}
          >
            Ignore
          </div>
          <div
            className="badge badge-success opacity-0"
            style={{
              opacity: posX > 30 ? Math.min(1, posX / THRESHOLD) : 0,
            }}
          >
            Interested
          </div>
        </div>

        <div className="card-actions justify-center my-4">
          {!isProfilePage ? (
            <>
              <button className="btn btn-error" onClick={onClickIgnore}>
                Ignore
              </button>
              <button className="btn btn-success" onClick={onClickInterested}>
                Interested
              </button>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
export default UserCard;
// ...existing code...