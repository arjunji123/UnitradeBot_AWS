import React, { useState, useEffect } from "react";
import Logo from "../utils/Logo";
// import Loader from '../components/Loader';
import SkeletonLoader from "../components/SkeletonLoader"; // Import the skeleton loader component
import { FaXTwitter, FaInstagram, FaLinkedin  , FaSnapchat, FaWhatsapp  } from "react-icons/fa6";
import { FaRegCheckCircle, FaYoutube  , FaTelegramPlane, FaPinterest , FaFacebook  } from "react-icons/fa";
import Follow from "../utils/Follow";
import CustomSwiper from '../utils/CustomSwiper';
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData, fetchQuestHistory } from "../../store/actions/homeActions";
import { BACKEND_URL } from "../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toastify CSS
import axios from "axios";

function Tasks() {
  const dispatch = useDispatch();
  const questHistory = useSelector((state) => state.apiData.data);
  const quest = questHistory?.quest?.quests
  const [loadingState, setLoadingState] = useState({});
  const [loading, setLoading] = useState(true);
  const [watchTimes, setWatchTimes] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [hasWatched, setHasWatched] = useState({});
  const [isVideoWatched, setIsVideoWatched] = useState({});
  const [followed, setFollowed] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [activeTaskKey, setActiveTaskKey] = useState(null);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const togglePopup = (taskKey, questId) => {
    setShowPopup(!showPopup);
    setActiveTaskKey(taskKey);
    setActiveQuestId(questId);
  };
  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]); // Capture screenshot
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // await dispatch(fetchAPIData("apiQuests")); // Additional API call (if needed)
        await dispatch(fetchQuestHistory());

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    fetchData();

  }, [dispatch]);

// useEffect(() => {
//     // Prevent drag gestures
//     const preventDrag = (e) => e.preventDefault();

//     document.addEventListener("dragstart", preventDrag);

//     return () => {
//       document.removeEventListener("dragstart", preventDrag);
//     };
//   }, []);

  const bannerQuests = quest && quest.filter(quest => quest.quest_type === "banner");
  const nonBannerQuests = quest && quest.filter(quest => quest.quest_type === "non-banner");
  
  const rows = nonBannerQuests && nonBannerQuests.filter((quest) => quest.activity === "watch").map((quest, index) => ({
    taskKey: `task${quest.quest_id}`, // Unique keys
    questId: quest.quest_id, // Add quest_id here
    title: quest.quest_name,
    icon: <FaYoutube size={32} color="white" className="mr-4" />,
    videoUrl: quest.quest_url,
    coin: quest.coin_earn,
    status: quest.status
  }));
  const handleWatchButtonClick = async (task, videoUrl) => {

    try {
      setWatchTimes(prev => ({ ...prev, [task]: Date.now() }));
      setIsVideoWatched(prev => ({ ...prev, [task]: true }));
      // Ensure the videoUrl is valid
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get("v");

      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Fetch the duration from YouTube API
      const duration = await fetchVideoDuration(videoId);
      setVideoDurations(prev => ({ ...prev, [task]: duration }));
    } catch (error) {
      console.error("Error handling video URL:", error);
      // Optional: Show an error message to the user
    }
  };

  const API_KEY = 'AIzaSyCNdfiNQIQ2H_-BN4vvddtlHBAbjsAwRTU';
  const fetchVideoDuration = async (videoId) => {


    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${API_KEY}`);
      const data = await response.json();
      if (data.items.length > 0) {
        const duration = data.items[0].contentDetails.duration;
        return convertDurationToSeconds(duration);
      }
      throw new Error("Video not found");
    } catch (error) {
      toast(`Error fetching video duration: ${error.message}`);
      return 0; // Default duration to 0 on error
    }
  };


  const convertDurationToSeconds = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0) * 3600;
    const minutes = (parseInt(match[2]) || 0) * 60;
    const seconds = parseInt(match[3]) || 0;
    return hours + minutes + seconds;
  };

  const handleCheckButtonClick = (task, questId) => {
    const currentTime = Date.now();
    const watchStartTime = watchTimes[task];
    const timeSpent = (currentTime - watchStartTime) / 1000;

    // Check against the video duration
    const requiredDuration = videoDurations[task] || 0;

    if (timeSpent >= requiredDuration) {
      completeQuest(questId, task);
    } else {
      const remainingTime = Math.max(requiredDuration - timeSpent, 0);
      // Convert remaining time to minutes and seconds
      const remainingMinutes = Math.floor(remainingTime / 60); // Get the minutes
      const remainingSeconds = Math.floor(remainingTime % 60); // Get the seconds

      // Format the time as 'minutes:seconds'
      const formattedTime = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      // console.log('formattedTime', formattedTime)
      toast(`You need to watch the video for ${formattedTime} minute more.`);
      setIsVideoWatched(prev => ({ ...prev, [task]: false }));
    }
  };

  const completeQuest = async (questId, task) => {
    // console.log("questIdquestId",questId);

    try {
      setLoadingState(prevState => ({ ...prevState, [task]: true }));
      const tokenData = localStorage.getItem("user");
      if (!tokenData) throw new Error("No token data found in localStorage");

      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;

      const response = await fetch(`${BACKEND_URL}/api/v1/api-quests/complete-quest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quest_id: questId }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
       // Simulate a delay after the request completes
    setTimeout(() => {
      setLoadingState(prevState => ({ ...prevState, [task]: false })); // End loading after delay
      dispatch(fetchQuestHistory());
      setHasWatched(prev => ({ ...prev, [task]: true }));
      toast("Task Completed!");
    }, 1500); // Delay of 1.5 seconds (adjust as needed)

    } catch (error) {
      toast.error(`Error completing task: ${error.message}`);
      console.error("Error completing quest:", error);
    }
  };
  const socials = nonBannerQuests && nonBannerQuests.filter((quest) => quest.activity === "follow").map((quest, index) => {
    let icon = null;
    if (quest.quest_name.toLowerCase().includes("youtube")) {
      icon = <FaYoutube size={32} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("telegram")) {
      icon = <FaTelegramPlane size={32} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("x")) {
      icon = <FaXTwitter size={32} color="white" className="mr-4" />;
    } else if (quest.quest_name.toLowerCase().includes("instagram")) {
      icon = <FaInstagram size={32} color="white" className="mr-4" />;
    }else if (quest.quest_name.toLowerCase().includes("linkedin")) {
      icon = <FaLinkedin  size={32} color="white" className="mr-4" />;
    }else if (quest.quest_name.toLowerCase().includes("pinterest")) {
      icon = <FaPinterest   size={32} color="white" className="mr-4" />;
    }else if (quest.quest_name.toLowerCase().includes("snapchat")) {
      icon = <FaSnapchat    size={32} color="white" className="mr-4" />;
    }else if (quest.quest_name.toLowerCase().includes("facebook")) {
      icon = <FaFacebook     size={32} color="white" className="mr-4" />;
    }else if (quest.quest_name.toLowerCase().includes("whatsapp")) {
      icon = <FaWhatsapp      size={32} color="white" className="mr-4" />;
    }
    return {
      icon,
    taskKey: `task${quest.quest_id}`, // Unique keys
    questId: quest.quest_id,
    title: quest.quest_name,
    // icon: quest.image,
    socialUrl: quest.quest_url,
    coin: quest.coin_earn,
    status: quest.status
  };
  });

  const handleFollowButtonClick = (task) => {
    setFollowed({
      ...followed,
      [task]: Date.now(),
    });
  };
  const handleSubmit = async (task, questId) => {

    // Basic validations
    if (!screenshot) {
      toast('Please upload a screenshot!');
      return;
    }

    if (!questId) {
      toast('Quest ID is required!');
      return;
    }

    if (!task) {
      toast('Task ID is required!');
      return;
    }

    try {
      setIsUploading(true);

      // Retrieve the token from localStorage
      const tokenData = localStorage.getItem("user");
      if (!tokenData) {
        throw new Error("No token data found in localStorage");
      }

      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;

      if (!token) {
        throw new Error("Token not found");
      }

      // 1. Upload the screenshot
      const formData = new FormData();
      formData.append('screenshot', screenshot);

      await axios.post(
        `${BACKEND_URL}/api/v1/upload-quest-screenshot/${questId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
          },
        }
      );
      dispatch(fetchQuestHistory());
      setFollowed(true);
      setShowPopup(false); // Close the pop-up
      toast("Follow Task Completed!");

    } catch (error) {
      console.error("Error completing follow quest:", error);
      toast.error("Error completing follow quest: " + error.message);
    } finally {
      setIsUploading(false); // Set uploading state to false
    }
  };


  return (
    <div className="bg-white flex justify-center min-h-screen font-Inter ">
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />
   {loading ? (
        <SkeletonLoader /> 
      ) : (
    <div className="w-full bg-black text-white  flex flex-col max-w-lg h-screen sm:mx-auto  font-Inter  ">
      <div className="flex-grow overflow-y-auto">
        <div className="px-2 py-6 h-full z-10">
          {/* <Logo /> */}
          <p className="text-left mt-6 text-lg font-extrabold font-Inter ml-2">EARN</p>
  
          {bannerQuests && bannerQuests.length > 0 && (
            <CustomSwiper 
              banners={bannerQuests}
              isVideoWatched={isVideoWatched}
              handleWatchButtonClick={handleWatchButtonClick}
              handleCheckButtonClick={handleCheckButtonClick}
              handleFollowButtonClick={handleFollowButtonClick}
              followed={followed}
              togglePopup={togglePopup}
              loadingState={loadingState}
              watchTimes={watchTimes}
            />
          )}
  
          <h1 className="text-center text-2xl text-white shadow-lg font-bold font-Inter mt-4">COIN QUESTS</h1>
  
          <div className=" h-fit mb-8 ">
            <div className="mt-4">
              {rows &&
                rows.map((row, index) => (
                  <div key={index} className="flex items-center justify-between bg-black py-2 px-4 font-Inter">
                    <div className="flex items-center">
                      {/* <img className="w-8 h-8 mr-4" src={row.icon} alt="" /> */}
                      {row.icon}
                      <div>
                        <h3 className="text-sm capitalize text-white font-bold">{row.title}</h3>
                        <p className="text-xs capitalize text-white font-semibold">+ {parseInt(row.coin)} Coin</p>
                      </div>
                    </div>
  
                    {row.status === "completed" ? (
                      <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-xs font-bold">
                        <FaRegCheckCircle size={20} className="text-[#606060]" />
                      </p>
                    ) : (
                      <>
                        {!watchTimes[row.taskKey] && (
                          <a
                            href={row.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleWatchButtonClick(row.taskKey, row.videoUrl)}
                            className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                          >
                            <span>Watch</span>
                          </a>
                        )}
  
                        {watchTimes[row.taskKey] && (
                          <button
                            onClick={() => handleCheckButtonClick(row.taskKey, row.questId)}
                            className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                          >
                           {loadingState[row.taskKey] ? (
           <div className="flex justify-center items-center">
           <div className="spinner"></div> {/* Custom spinner */}
         </div>
        ) : (
          "Verify"
        )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              <hr className="border-2 border-gray-50 w-2/3 mx-auto" />
            </div>
  
            <div className="mt-4">
              {socials &&
                socials.map((social, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between bg-black py-2 px-4 rounded-lg shadow-lg ">
                      <div className="flex items-center">
                      {social.icon}
                        {/* <img className="w-8 h-8 mr-4" src={social.icon} alt="" /> */}
                        <div>
                          <h3 className="text-sm capitalize text-white font-bold font-Inter">{social.title}</h3>
                          <p className="text-xs capitalize text-white font-semibold font-Inter">+ {parseInt(social.coin)} Coin</p>
                        </div>
                      </div>
  
                      {social.status === "not_completed" && !followed[social.taskKey] && (
                        <a
                          href={social.socialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleFollowButtonClick(social.taskKey)}
                          className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                        >
                          <span>Follow</span>
                        </a>
                      )}
                      {social.status === "not_completed" && followed[social.taskKey] && (
                        <button
                          onClick={() => togglePopup(social.taskKey, social.questId)}
                          className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                        >
                          Verify
                        </button>
                      )}
                      {social.status === "waiting" && (
                        <p className="bg-[#282828] text-[#aaa3a3] w-20 flex justify-center py-2 rounded-full text-sm font-bold" aria-disabled>
                          <span>Waiting</span>
                        </p>
                      )}
                      {social.status === "completed" && (
                        <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-xs font-bold">
                          <FaRegCheckCircle size={20} className="text-[#606060]" />
                        </p>
                      )}
                    </div>
                    <hr className="border-2 border-gray-700 w-2/3 mx-auto" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
         )
       <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3; /* Light background */
          border-top: 4px solid #000000; /* Black color */
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    <Footer />
  
    {showPopup && (
      <Follow
        togglePopup={() => togglePopup(null, null)}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        isUploading={isUploading}
        task={activeTaskKey}
        questId={activeQuestId}
      />
    )}
  </div>

  );
};

export default Tasks;

