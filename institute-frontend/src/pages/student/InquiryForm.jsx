import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InquiryForm = () => {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [fatherOccupation, setFatherOccupation] = useState('');
    const [fatherMobile, setFatherMobile] = useState('');
    const [motherOccupation, setMotherOccupation] = useState('');
    const [motherMobile, setMotherMobile] = useState('');
    const [referenceSource, setReferenceSource] = useState('Social Media Ads');
    const [otherReference, setOtherReference] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/inquiries/submit', {
                firstName,
                middleName,
                lastName,
                email,
                city,
                mobileNumber,
                fatherOccupation,
                fatherMobile,
                motherOccupation,
                motherMobile,
                referenceSource,
                otherReference: referenceSource === 'Other' ? otherReference : ''
            });
            toast.success("Thank you! Your inquiry was successfully registered. Our counsellors will call you shortly.");
            // Reset
            setFirstName('');
            setMiddleName('');
            setLastName('');
            setEmail('');
            setCity('');
            setMobileNumber('');
            setFatherOccupation('');
            setFatherMobile('');
            setMotherOccupation('');
            setMotherMobile('');
            setReferenceSource('Social Media Ads');
            setOtherReference('');
        } catch (error) {
            toast.error("Error submitting inquiry: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 flex justify-center items-center relative overflow-hidden">
            <ToastContainer theme="dark" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow"></div>

            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 text-left">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Smart Coaching Institute Admission Inquiry</h2>
                    <p className="text-xs text-slate-400 mt-2">Fill in your information below to register as an admission lead</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name *</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Middle Name</label>
                            <input
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Middle Name"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name *</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    {/* Email / Mobile / City */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="you@domain.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number *</label>
                            <input
                                type="tel"
                                required
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Enter mobile number"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Your city"
                            />
                        </div>
                    </div>

                    {/* Parent information */}
                    <div className="border-t border-slate-800 pt-6">
                        <h4 className="font-bold text-white text-xs mb-4">Parent details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's Occupation</label>
                                <input
                                    type="text"
                                    value={fatherOccupation}
                                    onChange={(e) => setFatherOccupation(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Occupation"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's Mobile Number</label>
                                <input
                                    type="tel"
                                    value={fatherMobile}
                                    onChange={(e) => setFatherMobile(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Mobile number"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mother's Occupation</label>
                                <input
                                    type="text"
                                    value={motherOccupation}
                                    onChange={(e) => setMotherOccupation(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Occupation"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mother's Mobile Number</label>
                                <input
                                    type="tel"
                                    value={motherMobile}
                                    onChange={(e) => setMotherMobile(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Mobile number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reference Source */}
                    <div className="border-t border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Reference Source *</label>
                            <select
                                value={referenceSource}
                                onChange={(e) => setReferenceSource(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                            >
                                <option value="Newspaper">Newspaper</option>
                                <option value="Social Media Ads">Social Media Ads</option>
                                <option value="Friends/Relatives">Friends/Relatives</option>
                                <option value="Other">Other - please specify</option>
                            </select>
                        </div>

                        {referenceSource === 'Other' && (
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Specify Source *</label>
                                <input
                                    type="text"
                                    required
                                    value={otherReference}
                                    onChange={(e) => setOtherReference(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Enter reference details"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 font-medium">* Required fields</span>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                        >
                            {submitting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                            ) : (
                                'Submit Registration Inquiry'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InquiryForm;
