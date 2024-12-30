import React, {useState, useEffect  } from 'react';
import { ImCross } from "react-icons/im";
import { sellCoins } from '../../store/actions/withdrawalActions';
import { fetchMeData } from '../../store/actions/homeActions';
import { useDispatch, useSelector } from 'react-redux';


function Send({ togglePopup, handleSellChange, handleSellSubmit , coinRanges , userData, company_id}) {
  const [loading, setLoading] = useState(false);
    const [rupeeValue, setRupeeValue] = useState(0);
    const upiId = userData?.upi_id; // Non-editable UPI ID
    const totalCoin = userData?.coins
    const companyId = String(company_id); 
    const [coinAmount, setCoinAmount] = useState('');
    const [selectedRate, setSelectedRate] = useState(""); // State to store the selected rate
    const [error, setError] = useState('');
  console.log("totalCoin",totalCoin);
  const dispatch = useDispatch();

  const handleRateChange = (event) => {
    const selectedRateValue = parseFloat(event.target.value); // Convert to number
    setSelectedRate(selectedRateValue);
    console.log("Selected Rate:", selectedRateValue);
};
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
     // Ensure that the input is a valid positive number (greater than or equal to 0)
  if (inputValue < 0) {
    // If a negative number is entered, reset to zero or handle accordingly
    setCoinAmount(0);
    setError('Amount cannot be negative');
    return;
  }

    // Check if input value exceeds the total available coins
    if (inputValue > totalCoin) {
      setError(`You have only  ${totalCoin} coins available.`);
    } else {
      setError(''); // Clear error if within limit
    }

    setCoinAmount(inputValue);
  };

  useEffect(() => {
    const totalRupees = coinAmount * selectedRate;
    setRupeeValue(totalRupees ? totalRupees.toFixed(2) : 0);
}, [coinAmount, selectedRate]);
     

    const handleSubmit = () => {
      if (!coinAmount || coinAmount > totalCoin) {
          setError("Please enter a valid coin amount within your balance.");
          return;
      }
      if (!selectedRate) {
        setError("Please select a coin rate.");
        return;
    }

      setLoading(true);
      // Prepare the API payload
      const payload = {
          upi_id: upiId,
          company_id: companyId,
          tranction_coin: Number(coinAmount),
          transction_amount: Number(rupeeValue),
          tranction_rate: Number(selectedRate),
      };

      // Dispatch the sellCoins action with the required fields
      dispatch(sellCoins(payload))
      dispatch(fetchMeData())
          .then(() => togglePopup()) // Close popup on successful action
          .catch((err) => setError("Failed to sell coins. Please try again."));
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
    <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl max-w-lg relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
        <ImCross size={20} />
      </button>

      <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Sell Coin</h2>

      {/* Description */}
      <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
        Please enter the amount and your UPI ID to generate the QR code for Sell your coin.
      </p>

      <input
         type="number"
         min="0" // Prevent negative numbers
         value={coinAmount}
         onChange={handleInputChange}
         placeholder="Enter coin amount"
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
      />
       {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {/* <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">Rupee Value: ₹{rupeeValue}</p> */}
      <div className="flex flex-col items-start">
      <select
        id="coinRate"
        value={selectedRate}
        onChange={handleRateChange}
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base0"
      >
        <option value="" disabled>
          Choose a rate
        </option>
        {coinRanges.map((range, index) => (
          <option key={index} value={range.rate}>
            {`Range: ${range.min_coins}-${range.max_coins}, Rate: ${range.rate}`}
          </option>
        ))}
      </select>
      {/* {selectedRate && (
        <p className="mt-3 text-gray-600">
          You selected a rate of: <strong>{selectedRate}</strong>
        </p>
      )} */}
    </div>  
<div className='flex justify-between items-center w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3  transition duration-300 text-sm sm:text-base'>
    <div>Coin Rate: ₹{selectedRate}</div>
   <div>= ₹<span className='' > {rupeeValue}</span></div> 
</div>
      <input
        type="text"
        name="address"
        value={upiId}
        readOnly
        placeholder="Enter UPI ID for QR code"
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
      />

      {/* <div className="flex justify-center items-center bg-[#2C2C2C] p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
        <canvas id="qrcode" ref={qrRef} className="rounded-lg"></canvas>
      </div> */}

      <div className="flex justify-center items-center">
        <button  onClick={handleSubmit} className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"  disabled={loading} >
        {loading ? (
              <div className="flex justify-center items-center">
                <div className="spinner"></div> {/* Custom spinner */}
              </div>
            ) : (
              'Submit' // Normal button text
            )}
        </button>
      </div>
    </div>
      {/* CSS for Custom Spinner */}
      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3; /* Light background */
          border-top: 4px solid #000000; /* Black color */
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

  )
}

export default Send
