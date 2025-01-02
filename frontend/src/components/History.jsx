import React, { useState, useEffect, useMemo } from "react";
import {  BsCoin } from "react-icons/bs";
import { FaChevronLeft } from "react-icons/fa";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { fetchHistory, fetchWithdrawal, userApprove } from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

const TransactionHistory = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux states
  const historyData = useSelector((state) => state.apiData.data.history?.data || []);
  const withdrawal = useSelector((state) => state.apiData.data.withdrawal?.data || []);
  const [activeTab, setActiveTab] = useState("History");
console.log('withdrawal', withdrawal)
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchHistory());
        await dispatch(fetchWithdrawal());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);


useEffect(() => {
  // Select the specific div using a class or ID
  const targetDiv = document.querySelector('.no-drag'); // Example with class 'no-drag'

  // Prevent drag events on the specific div
  const preventDrag = (e) => {
    e.preventDefault();
  };

  // Prevent touchmove events on the specific div
  const preventTouch = (e) => {
    e.preventDefault(); // Prevent any touch gesture (drag) on the target div
  };

  if (targetDiv) {
    // Add event listeners only to the specific div
    targetDiv.addEventListener("dragstart", preventDrag);
    targetDiv.addEventListener("touchmove", preventTouch, { passive: false });
  }

  return () => {
    if (targetDiv) {
      targetDiv.removeEventListener("dragstart", preventDrag);
      targetDiv.removeEventListener("touchmove", preventTouch);
    }
  };
}, []);



  // Group transactions by date
  const groupByDate = (data) =>
    data.reduce((acc, item) => {
      const date = new Date(item.transaction_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

  // Group transactions by date
  const groupByDateWith = (data) =>
    data.reduce((acc, item) => {
      const date = new Date(item.date_entered).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

  const groupedTransactions = useMemo(() => groupByDate(historyData), [historyData]);
  const groupedWithdrawals = useMemo(() => groupByDateWith(withdrawal), [withdrawal]);

  // Handle tab switch
  const handleTabSwitch = (tab) => setActiveTab(tab);

  // Handle approve action
  const handleApprove = async (transaction_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this transaction?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
      customClass: {
        popup: "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]", // Popup styling
        title: "text-white text-sm sm:text-base font-bold", // Title styling
        content: "text-gray-300 text-xs sm:text-sm", // Content styling
        confirmButton: "bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded",
        cancelButton: "bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true); // Show loader
        try {
          await dispatch(userApprove({ transaction_id }));
          await dispatch(fetchWithdrawal());
          await dispatch(fetchHistory()); // Refresh history data
          Swal.fire({
            title: "Approved!",
            text: "The transaction has been approved.",
            icon: "success",
            customClass: {
              popup: "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]",
              title: "text-white text-sm sm:text-base font-bold",
              content: "text-gray-300 text-xs sm:text-sm",
            },
          });
        } catch (error) {
          Swal.fire({
            title: "Failed!",
            text: "The transaction could not be approved.",
            icon: "error",
            customClass: {
              popup: "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]",
              title: "text-white text-sm sm:text-base font-bold",
              content: "text-gray-300 text-xs sm:text-sm",
            },
          });
        } finally {
          setLoading(false); // Hide loader
        }
      }
    });
  };
  
  return (
    // <div  className="bg-white min-h-screen flex justify-center overflow-hidden" >
          <div className="bg-white flex justify-center min-h-screen font-Inter overflow-hidden">

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-black text-white w-full max-w-lg flex flex-col px-4 overflow-hidden">

          <div className="flex items-center justify-between py-4 hide-scrollbar overflow-y-auto">
            <button onClick={() => navigate(-1)} className="text-2xl text-white cursor-pointer">
              <FaChevronLeft />
            </button>
          </div>

          {/* Tab Navigation */}
          <div id = "no-drag" className="flex items-center bg-[#1C1C1E] justify-between rounded-xl hide-scrollbar overflow-y-auto">
            <button
              className={`flex-1 py-2.5 text-center font-medium transition-all duration-200 ${
                activeTab === "History" ? "bg-[#282828] rounded-xl text-white" : "text-gray-100"
              }`}
              onClick={() => handleTabSwitch("History")}
            >
              History
            </button>
            <button
              className={`flex-1 py-2.5 text-center font-medium transition-all duration-200 ${
                activeTab === "Withdrawal" ? "bg-[#282828] rounded-xl text-white" : "text-gray-100"
              }`}
              onClick={() => handleTabSwitch("Withdrawal")}
            >
              Withdrawal
            </button>
          </div>
    

     
          <div id="content" className="flex-grow py-4 h-[400px] overflow-y-auto hide-scrollbar" style={styles.content}>
            {activeTab === "History" && (
              <>
                {Object.keys(groupedTransactions).length > 0 ? (
                  Object.keys(groupedTransactions).map((date) => (
                    <div key={date} className="mb-6">
                      <p className="text-sm font-semibold text-gray-400 mb-3">{date}</p>
                      {groupedTransactions[date].map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between py-3">
                          <div className="flex items-center space-x-3">
                            {/* <BsCoin size={30} className="text-white" /> */}
                            <img src="src/assets/logo/U.png" className="w-5 h-5" alt="" />
                            <h3 className="text-sm font-semibold capitalize">{transaction.title}</h3>
                          </div>
                          <p className="text-sm font-medium">
                            {transaction.pending_coin === 0
                              ? `${transaction.earn_coin > 0 ? "" : ""}${transaction.earn_coin} Coins`
                              : ` ${transaction.pending_coin} Coins`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No transactions found.</p>
                )}
              </>
            )}

            {activeTab === "Withdrawal" && (
              <>
                {Object.keys(groupedWithdrawals).length > 0 ? (
                  Object.keys(groupedWithdrawals).map((date) => (
                    <div key={date} className="mb-6">
                      <p className="text-sm font-semibold text-gray-400 mb-3">{date}</p>
                      {groupedWithdrawals[date].map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between py-3">
                          <div className="flex items-center space-x-3">
                          <img src="src/assets/logo/U.png" className="w-5 h-5" alt="" />
                          <h3 className="text-sm font-semibold capitalize">{transaction.title}</h3>
                          </div>
                          <button
                            onClick={() => handleApprove(transaction.transaction_id)}
                            className="leading-none capitalize px-4 py-2 text-[13px] rounded-full bg-[#282828] flex text-white font-semibold hover:bg-[#1C1C1E] transition duration-200 ease-in-out"
                          >
                            {transaction && transaction.status ? "Approve": "Waiting"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No transactions found.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};
const styles = {
  content: {
    // height: '100vh', // Full viewport height
    overflowY: 'auto', // Enable vertical scrolling
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  },
};
export default TransactionHistory;
