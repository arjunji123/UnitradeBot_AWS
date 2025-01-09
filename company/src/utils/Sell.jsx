import React, { useState, useEffect, useRef } from 'react';
import { ImCross } from 'react-icons/im';
import { uploadTransactionDoc } from '../../store/actions/withdrawalActions';
import { fetchUserData } from '../../store/actions/homeActions';
import { useDispatch, useSelector } from 'react-redux';
import { BsCurrencyRupee } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

function Send({ togglePopup, userDetail, resetUserDetail }) {
  const [transactionId, setTransactionId] = useState(userDetail?.id || '');
    // States for form inputs
    const [transId, setTransId] = useState('');
    const [utrNo, setUtrNo] = useState('');
  const [payImage, setPayImage] = useState(null);
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.moneyData);
  const fetchCalled = useRef(false);

 // Handle file input change
 const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setPayImage(file);
  }
};

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
 // Ensure either `trans_id` or `utr_no` is provided
    if (!transId && !utrNo) {
      console.log('Either Transaction ID or UTR No. is required');
      return;
    }
     // Build the payload
     const payload = {
      transaction_id: transactionId,
      trans_id: transId || null, // Add `trans_id` only if provided
      utr_no: utrNo || null, // Add `utr_no` only if provided
      trans_doc: payImage || null, // Add `trans_doc` (image) if provided
    };

    // Log the payload for debugging
    console.log('Payload:', payload);
// Dispatch the action with the payload
dispatch(uploadTransactionDoc(payload));
  };
  useEffect(() => {
    if (success) {
      // Reset state after successful submission
      dispatch(fetchUserData());
      togglePopup();
      resetUserDetail(); // Reset user details
    }
  }, [success, dispatch, togglePopup, resetUserDetail]);
  // Sync transaction ID when userDetail changes
  useEffect(() => {
    setTransactionId(userDetail && userDetail.id);
  }, [userDetail]);

  const handleCopy = () => {
    if (userDetail?.upiId) {
      navigator.clipboard.writeText(userDetail.upiId);
      toast("UPI ID copied to clipboard!");
    }
  };
  return (
    <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
      <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
          <ImCross size={20} />
        </button>

        <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Transaction Details</h2>

        <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">Check User Detail and upload screenshot of payment</p>

        <div className="text-center mb-6 bg-black p-4 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">User Name:</span>
              <span className="font-medium text-[#B0B0B0] text-sm">{userDetail?.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="font-medium text-[#B0B0B0] text-sm flex"><BsCurrencyRupee className="mt-0.5" size={16} />{userDetail?.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Coins:</span>
              <span className="font-medium text-[#B0B0B0] text-sm">{userDetail?.coin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">UPI ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#B0B0B0] text-sm">{userDetail?.upiId}</span>
                <button
                  onClick={handleCopy}
                  className="text-white"
                  title="Copy UPI ID"
                >
                  <FaRegCopy className="text-white hover:text-blue-600 text-lg" />
                </button>
              </div>
            </div>


          </div>
        </div>
        <input
            type="text"
            value={transId}
            onChange={(e) => setTransId(e.target.value)}
            placeholder="Enter Transaction Id"
            className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
          />
          <input
                type="text"
                value={utrNo}
                onChange={(e) => setUtrNo(e.target.value)}
            placeholder="Enter UTR No."
            className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
          />
  
          <p className="text-sm sm:text-base text-[#B0B0B0] text-center ">OR</p>
        <div>
          <label className="font-medium text-[#B0B0B0] my-1" htmlFor="payImage">Payment Image:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full uppercase p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            placeholder="Pay Image"
            required
          />
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={handleSubmit}
            className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="spinner"></div>
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </div>


      </div>

      {/* CSS for Custom Spinner */}
      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #000000;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Send;
