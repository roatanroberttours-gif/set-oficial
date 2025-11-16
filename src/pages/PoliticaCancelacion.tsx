import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseSet } from '../hooks/supabaseset';

const PoliticaCancelacion: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const client = useSupabaseSet();
  const [admin, setAdmin] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await client.from('admin').select('*').maybeSingle();
        if (error) throw error;
        if (mounted) setAdmin(data || null);
      } catch (err) {
        console.error('Error loading admin for policy page:', err);
      }
    })();
    return () => { mounted = false; };
  }, [client]);

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <nav className="text-sm text-gray-500 space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:underline">Services</Link>
            <span>/</span>
            <Link to="/gallery" className="hover:underline">Gallery</Link>
            <span>/</span>
            <Link to="/meeting-points" className="hover:underline">Meeting Points</Link>
            <span>/</span>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <span>/</span>
            <span className="font-medium text-gray-800">Print policy</span>
          </nav>

          <div>
            <button onClick={handlePrint} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Print policy</button>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">BOOKING POLICY &amp; TERMS OF SERVICE</h1>

        <p className="text-sm text-gray-600 mb-6">Roatan Robert Tours, hereinafter referred to as “Roatan Robert Tours”</p>

        <section className="prose prose-lg text-gray-700">
          <h2>Booking and Payment</h2>
          <ul>
            <li>Full payment is required at the time of booking.</li>
            <li>We accept credit cards, bank transfers, and payments via WhatsApp Business or direct link.</li>
            <li>International payments must be made by credit card.</li>
          </ul>

          <h2>International Transactions</h2>
          <p>All prices and payments are in US dollars (USD). The client is responsible for any exchange rates and international fees that may apply. For transactions originating outside Honduras, only credit card payments are accepted.</p>

          <h2>Communications and Notifications</h2>
          <p>All booking confirmations, receipts, instructions, and communications will be sent to the email or phone number provided during booking. The client is responsible for:</p>
          <ul>
            <li>Providing accurate contact information.</li>
            <li>Maintaining a valid email and phone number.</li>
            <li>Checking their inbox (including “spam”).</li>
            <li>Ensuring receipt of text or WhatsApp messages.</li>
          </ul>
          <p className="italic">It is recommended to add <strong>{admin?.correo || 'rteastendexp@gmail.com'}</strong> to your safe contacts list.</p>

          <h2>Arrival and Departure Requirements</h2>
          <ol>
            <li>Tour time: All tours operate on local Honduran time (UTC/GMT-6). Your pick-up time will be confirmed at booking or before port arrival.</li>
            <li>Meet your guide: Follow the provided meeting instructions. Present your booking confirmation and valid ID.</li>
            <li>Late arrivals: Late arrivals will be marked as “No Show” with no refund, unless previously notified and Roatan Robert Tours has confirmed a new time.</li>
            <li>Return to port: All participants must return to the port at least one hour before ship departure. Roatan Robert Tours is not responsible for missed departures or extra costs due to client delays.</li>
          </ol>

          <h2>Participant Verification</h2>
          <p>All participants must present a valid booking confirmation (digital or printed) and official ID. Lack of documentation may result in denial of service without refund.</p>

          <h2>Waiver and Release of Liability</h2>
          <ul>
            <li>Mandatory form: All participants must sign a Waiver of Liability Form before the excursion. No modifications or alternative forms will be accepted.</li>
            <li>Participant responsibilities: Each client must review the terms before booking, provide truthful information, and disclose relevant medical conditions.</li>
            <li>Exclusion without refund: Participation will be denied if the client does not sign the waiver, alters the waiver, or provides false or incomplete information.</li>
            <li>Medical conditions: Failure to disclose medical conditions may result in immediate removal from the tour without refund, and the client will assume any additional expenses.</li>
          </ul>

          <h2>Transportation and Liability</h2>
          <p>Roatan Robert Tours works with carefully selected local transportation providers. However, Roatan Robert Tours acts only as a booking agent, not as a direct operator.</p>
          <p>We are not responsible for negligence or conduct of third parties, damages, losses, or accidents during transportation, or schedule changes or delays.</p>

          <h2>Participant Removal Policy</h2>
          <p>Roatan Robert Tours guides may remove any participant whose behavior affects the safety or experience of others. Grounds for immediate removal include intoxication, aggressive behavior, harassment, dangerous conduct, property damage, or illegal activities. Removed participants will not receive a refund and will assume all resulting expenses.</p>

          <h2>Cancellations and Refunds</h2>
          <p>All cancellation requests must be sent in writing to: <strong>{admin?.correo || 'rteastendexp@gmail.com'}</strong> with the subject: “Cancellation” or “Refund” + booking number. Verbal or automatic cancellations are not accepted.</p>

          <table className="table-auto border-collapse border border-gray-200 w-full mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Notice Period</th>
                <th className="border px-3 py-2 text-left">Refund</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">72 hours or more</td>
                <td className="border px-3 py-2">100% - 4% transaction fee</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">48-72 hours</td>
                <td className="border px-3 py-2">50% - 4% transaction fee</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">48 hours or less</td>
                <td className="border px-3 py-2">No refund</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">No show</td>
                <td className="border px-3 py-2">No refund</td>
              </tr>
            </tbody>
          </table>

          <p>If your cruise does not dock in Roatan, you will receive a full refund minus a 4% transaction fee. Approved refunds are processed within a maximum of 90 days and issued to the same original payment method.</p>

          <h2>Booking Transfers</h2>
          <p>With at least 48 hours’ notice, you may transfer your credit to another person or Roatan Robert Tours service. If the new service costs less, the difference will not be refunded.</p>

          <h2>Weather Conditions</h2>
          <p>Light rain or normal tropical conditions are not grounds for cancellation. Only if Roatan Robert Tours determines the weather is unsafe will the excursion be canceled with a full refund.</p>

          <h2>Recommended Insurance</h2>
          <p>Maintaining medical and international travel insurance is advised. Roatan Robert Tours does not provide insurance coverage to participants.</p>

          <h2>Legal Notices</h2>
          <p>Roatan Robert Tours reserves the right to modify itineraries, cancel tours, deny service, or use photographic material for promotional purposes.</p>

          <h2>Limitations of Liability</h2>
          <p>Roatan Robert Tours assumes no responsibility for personal injuries, medical expenses, property loss, third-party services or events beyond its control, or missed departures due to client error or delay.</p>

          <h2>Animal Encounters</h2>
          <p>Participants must follow the guide’s instructions at all times. Those acting recklessly or dangerously may be removed without refund. Roatan Robert Tours does not guarantee encounters with specific animals. By booking, the participant accepts all risks associated with animal interactions and releases Roatan Robert Tours from all liability.</p>
        </section>
      </div>
    </div>
  );
};

export default PoliticaCancelacion;
