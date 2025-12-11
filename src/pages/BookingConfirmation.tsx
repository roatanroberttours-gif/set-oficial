import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Mail, AlertTriangle } from "lucide-react";

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, tourDate, cruiseName } = location.state || {};

  if (!email || !cruiseName) {
    navigate("/private-tour");
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Form Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Thanks for filling out our form to check for tour
            availability/pricing
            {tourDate && (
              <span className="font-semibold text-teal-600">
                {" "}
                for {tourDate}
              </span>
            )}{" "}
            arriving on the{" "}
            <span className="font-semibold text-teal-600">{cruiseName}</span>!
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                YOUR TOUR IS NOT CONFIRMED...YET!
              </h3>
              <p className="text-gray-700">
                Look for an email containing Tour Availability and Tour Pricing
                soon.
              </p>
            </div>
          </div>
        </div>

        {/* Response Time Notice */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700 leading-relaxed">
            We will try to respond to your information request as soon as
            possible -- please allow us a little extra time, as internet
            connectivity can be a problem on Roatan!
          </p>
        </div>

        {/* Email Verification */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Please double-check the email address that you input:
          </h3>
          <div className="flex items-center justify-center bg-white p-4 rounded-lg border-2 border-teal-500">
            <Mail className="w-5 h-5 text-teal-600 mr-3" />
            <span className="text-xl font-mono text-gray-900">{email}</span>
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            If it's incorrect, please re-submit your form with the correct
            information.
          </p>
        </div>

        {/* Important Gmail Notice */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            IMPORTANT NOTE:
          </h3>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              If the email address shown above IS correct and you don't receive
              a copy of this Form Submission in your email, please check your{" "}
              <span className="font-bold text-red-700">SPAM</span> or{" "}
              <span className="font-bold text-red-700">PROMOTIONS</span>{" "}
              folders!
            </p>
            <p>
              This is especially important for Gmail accounts: Without asking
              your permission first, Gmail now automatically filters any
              information-filled emails that we send into their PROMOTIONS
              folder so you will no longer be able to see them in your INBOX.
              This means that unless you change your settings in Gmail, you
              won't be seeing any of the info I send to your INBOX...you'll have
              to look for it in your PROMOTIONS folder.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/private-tour")}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all"
          >
            Back to Private Tours
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
