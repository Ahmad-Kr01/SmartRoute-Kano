import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, MessageSquare, Star, ShieldCheck, 
  Clock, CheckCircle, Navigation, ShieldAlert, KeyRound, 
  Map, Eye, Compass, Search, RefreshCw, Send, AlertTriangle, Truck,
  LogIn, LogOut, Plus, Trash2, ShieldCheck as VerifiedIcon, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  subscribeAuth, 
  subscribeShipments, 
  createShipment, 
  updateShipmentStatus, 
  deleteShipment,
  DbShipment,
  RiderMapType,
  TimelineCheckpost
} from '../lib/firebase';
import { User } from 'firebase/auth';
import { 
  sendOutboundSms, 
  fetchSmsLogs, 
  clearSmsLogs, 
  SmsLog, 
  SmsBackendConfig 
} from '../lib/sms';

const INITIAL_SHIPMENTS: DbShipment[] = [
  {
    id: 'SRK-TRACK-592',
    recipient: 'Alhaji Yusuf & Sons Ltd',
    recipientPhone: '+2348037629481',
    destination: 'Kantin Kwari Market, Row D',
    hub: 'Dala Dry Port Hub',
    sender: 'Northern Grains Corp',
    cargo: 'Cotton Textiles Bundles',
    weight: '1,820 kg',
    status: 'In Transit',
    otpCode: '4821',
    ownerId: 'default',
    rider: {
      name: 'Musa Bello',
      phone: '+234 803 762 9481',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      rating: 4.9,
      vehicle: 'Solar cargo tricycle (SRK-TRI-04)',
      license: 'KN-940-A3',
      location: 'Near Sabon Gari Roundabout'
    },
    timeline: [
      { time: '07:30 AM', status: 'Booked', desc: 'Freight routing allocated from Dala Logistics Depot', done: true },
      { time: '08:15 AM', status: 'Sorted', desc: 'Weighed, balanced & loaded on electric trike', done: true },
      { time: '09:00 AM', status: 'In Transit', desc: 'Left Dala main hub. Path optimized to bypass Kwari peak traffic', done: true },
      { time: '09:40 AM', status: 'Delivering', desc: 'Rider approaching Kwari Textile market Row D', done: false },
    ]
  },
  {
    id: 'SRK-TRACK-104',
    recipient: 'Binta Suleiman Flour Mills',
    recipientPhone: '+2348125593012',
    destination: 'Fagge Commercial Row',
    hub: 'Nassarawa Grain Hub',
    sender: 'Sahel Agricultural Depot',
    cargo: 'Premium Agro Wheat Sacks',
    weight: '2,400 kg',
    status: 'Out for Delivery',
    otpCode: '8392',
    ownerId: 'default',
    rider: {
      name: 'Ibrahim Danlami',
      phone: '+234 812 559 3012',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: 4.8,
      vehicle: 'Electric Delivery Truck (SRK-EV-02)',
      license: 'KN-222-S8',
      location: 'Fagge Market main street entry'
    },
    timeline: [
      { time: '06:45 AM', status: 'Booked', desc: 'Bulk agricultural allocation registered', done: true },
      { time: '07:15 AM', status: 'Sorted', desc: 'Quality assurance checklist validated', done: true },
      { time: '08:00 AM', status: 'In Transit', desc: 'Dispatched through Fagge Ring Road bypass', done: true },
      { time: '09:15 AM', status: 'Out for Delivery', desc: 'Rider is unloading at Fagge Commercial Warehouse', done: true },
    ]
  },
  {
    id: 'SRK-TRACK-883',
    recipient: 'Kano Tech Hub Labs',
    recipientPhone: '+2349058817733',
    destination: 'Gwale Innovation Cluster',
    hub: 'Dala Dry Port Hub',
    sender: 'Silicon Border Imports',
    cargo: 'Smart Telemetry IoT Radios',
    weight: '34 kg',
    status: 'Delivered',
    otpCode: '1095',
    ownerId: 'default',
    rider: {
      name: 'Aminu Katsina',
      phone: '+234 905 881 7733',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      vehicle: 'Solar E-Bike Courier (SRK-MOTO-19)',
      license: 'KN-591-B7',
      location: 'Returned to Gwale base'
    },
    timeline: [
      { time: 'Yesterday', status: 'Booked', desc: 'Imported package logged in Dala schedule', done: true },
      { time: 'Yesterday', status: 'In Transit', desc: 'Optimized via inner ring bypass', done: true },
      { time: '08:30 AM', status: 'Out for Delivery', desc: 'Aminu on site with solar E-Bike package', done: true },
      { time: '09:05 AM', status: 'Delivered', desc: 'Recipient verified matching OTP successfully', done: true },
    ]
  }
];

export default function TrackingDashboard() {
  // Firebase State states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbShipments, setDbShipments] = useState<DbShipment[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(false);

  // Local fallback states
  const [localShipments, setLocalShipments] = useState<DbShipment[]>(INITIAL_SHIPMENTS);

  // Common Layout and Inputs Selection states
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SHIPMENTS[0].id);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<'vector' | 'satellite' | 'traffic'>('vector');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [simulatedTransitProgress, setSimulatedTransitProgress] = useState<number>(65);

  // Creation modal states
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newRecipient, setNewRecipient] = useState<string>('');
  const [newRecipientPhone, setNewRecipientPhone] = useState<string>('');
  const [newDestination, setNewDestination] = useState<string>('');
  const [newCargo, setNewCargo] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('250 kg');
  const [newHub, setNewHub] = useState<string>('Dala Dry Port Hub');
  const [newSender, setNewSender] = useState<string>('Northern Grains Corp');
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // Africa's Talking SMS states
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [smsConfig, setSmsConfig] = useState<SmsBackendConfig>({ isLiveActive: false, username: 'sandbox (fallback)', senderId: 'None' });
  const [customSmsPhone, setCustomSmsPhone] = useState<string>('');
  const [customSmsMessage, setCustomSmsMessage] = useState<string>('');
  const [isSmsSending, setIsSmsSending] = useState<boolean>(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Africa's Talking interactive config override for instant sandbox testing
  const [overrideUsername, setOverrideUsername] = useState<string>(() => localStorage.getItem('at_override_username') || '');
  const [overrideApiKey, setOverrideApiKey] = useState<string>(() => localStorage.getItem('at_override_apikey') || '');
  const [overrideSenderId, setOverrideSenderId] = useState<string>(() => localStorage.getItem('at_override_senderid') || '');
  const [isOverrideOpen, setIsOverrideOpen] = useState<boolean>(false);

  // Derive target shipments list based on auth
  const shipments = currentUser ? dbShipments : localShipments;
  const isCloudMode = currentUser !== null;

  // Selected shipment calculation safeguards
  const selectedShipment = shipments.find(s => s.id === selectedId) || shipments[0] || null;

  // Track Firebase Auth state transformations
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setDbLoading(true);
      } else {
        setDbShipments([]);
        setDbLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Track Real-time Firestore query listener when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeShipments(
      (updatedList) => {
        setDbShipments(updatedList);
        setDbLoading(false);
        // Automatically set first record as selected if preceding lost
        if (updatedList.length > 0 && !updatedList.some(s => s.id === selectedId)) {
          setSelectedId(updatedList[0].id);
        }
      },
      (error) => {
        console.error('Real-time listener failed:', error);
        setDbLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, selectedId]);

  // Telemetry map movement simulation loops
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedTransitProgress(prev => {
        if (prev >= 100) return 40; 
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load Africa's Talking logs and configure status
  const loadSmsLogsAndConfig = async () => {
    try {
      const data = await fetchSmsLogs();
      if (data.success) {
        setSmsLogs(data.logs);
        // If there's client runtime override, show live is active if we have local credentials
        const localActive = overrideUsername.trim() !== '' && overrideApiKey.trim() !== '';
        setSmsConfig({
          isLiveActive: data.config.isLiveActive || localActive,
          username: overrideUsername || data.config.username,
          senderId: overrideSenderId || data.config.senderId
        });
      }
    } catch (e) {
      console.error('Error fetching SMS logs:', e);
    }
  };

  useEffect(() => {
    loadSmsLogsAndConfig();
    // Poll logs every 15 seconds to keep the live terminal updated
    const interval = setInterval(loadSmsLogsAndConfig, 15000);
    return () => clearInterval(interval);
  }, [overrideUsername, overrideApiKey, overrideSenderId]);

  // Handle triggered outbound SMS alert
  const dispatchSmsNotification = async (params: {
    waybillId: string;
    recipient: string;
    phone: string;
    message: string;
  }) => {
    try {
      // Build override configuration if existing
      const overrideConfig = (overrideUsername && overrideApiKey) ? {
        username: overrideUsername,
        apiKey: overrideApiKey,
        senderId: overrideSenderId
      } : undefined;

      // Call API
      const result = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...params,
          overrideConfig
        })
      });

      const responseData = await result.json();
      loadSmsLogsAndConfig();
      return responseData;
    } catch (err) {
      console.error('Failed to dispatch SMS notification:', err);
    }
  };

  // Google Login click event
  const handleAuthLogin = async () => {
    try {
      setDbLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setDbLoading(false);
    }
  };

  const handleAuthLogout = async () => {
    try {
      await logoutUser();
      setSelectedId(INITIAL_SHIPMENTS[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  // Seed default demonstration records to firestore upon first onboarding login
  const handleSeedCollection = async () => {
    if (!currentUser) return;
    try {
      setDbLoading(true);
      for (const item of INITIAL_SHIPMENTS) {
        await createShipment({
          ...item,
          id: `${item.id}-${Math.floor(Math.random() * 90) + 10}` // append randomized code suffix for security
        });
      }
    } catch (error) {
      console.error('Seeding was rejected:', error);
    } finally {
      setDbLoading(false);
    }
  };

  // Submit waybill otp verification
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    if (otpInput === selectedShipment.otpCode) {
      setOtpError(null);
      setOtpSuccess(true);
      
      const updatedTimeline = selectedShipment.timeline.map((t, idx) => {
        // Mark remaining milestones as complete
        return { ...t, done: true };
      });

      if (isCloudMode) {
        try {
          await updateShipmentStatus(selectedShipment.id, 'Delivered', updatedTimeline);
        } catch (error: any) {
          setOtpError(`Firestore Rejected: ${error.message}`);
        }
      } else {
        setLocalShipments(prev => prev.map(ship => {
          if (ship.id === selectedShipment.id) {
            return {
              ...ship,
              status: 'Delivered',
              timeline: updatedTimeline
            };
          }
          return ship;
        }));
      }

      setTimeout(() => {
        setOtpSuccess(false);
        setOtpInput('');
      }, 3000);

    } else {
      setOtpError('Incorrect 4-digit code. Please verify the secure waypoint receipt hash.');
      setOtpSuccess(false);
    }
  };

  // Status transitions
  const handleStatusProgress = async (targetStatus: 'Pre-Dispatch' | 'In Transit' | 'Out for Delivery' | 'Delivered') => {
    if (!selectedShipment) return;

    const timelineTexts = {
      'Pre-Dispatch': 'Consignment booked and verified inside regional depot hub queue.',
      'In Transit': 'Freight loaded on solar transport courier. Dispatch corridor active.',
      'Out for Delivery': 'Carrier approach bypass completed, nearing customers warehouse.',
      'Delivered': 'Waybill verified by secure customer SMS handshake token matching.'
    };

    // Calculate progression markers
    const updatedTimeline = selectedShipment.timeline.map((mile, i) => {
      let isDone = false;
      if (targetStatus === 'Pre-Dispatch' && i === 0) isDone = true;
      if (targetStatus === 'In Transit' && i <= 2) isDone = true;
      if (targetStatus === 'Out for Delivery' && i <= 3) isDone = true;
      if (targetStatus === 'Delivered') isDone = true;

      // Update desc text representing active status
      const desc = mile.status === targetStatus ? timelineTexts[targetStatus] : mile.desc;
      return { ...mile, done: isDone, desc };
    });

    let syncOk = false;
    if (isCloudMode) {
      try {
        await updateShipmentStatus(selectedShipment.id, targetStatus, updatedTimeline);
        syncOk = true;
      } catch (error: any) {
        alert(`Status adjustment locked. Cloud rules refused: ${error.message}`);
      }
    } else {
      setLocalShipments(prev => prev.map(ship => {
        if (ship.id === selectedShipment.id) {
          return { ...ship, status: targetStatus, timeline: updatedTimeline };
        }
        return ship;
      }));
      syncOk = true;
    }

    if (syncOk) {
      const statusMessageTexts = {
        'Pre-Dispatch': `SmartRoute Kano: Waybill ${selectedShipment.id} is confirmed Pre-Dispatched at ${selectedShipment.hub}. OTP token for pickup: ${selectedShipment.otpCode || 'N/A'}.`,
        'In Transit': `SmartRoute Kano: Waybill ${selectedShipment.id} is now In Transit. Delivery courier ${selectedShipment.rider.name} has departed ${selectedShipment.hub}.`,
        'Out for Delivery': `SmartRoute Kano: Waybill ${selectedShipment.id} is Out for Delivery! Courier ${selectedShipment.rider.name} is approaching ${selectedShipment.destination.split(',')[0]}. Secure verification OTP: ${selectedShipment.otpCode || 'N/A'}.`,
        'Delivered': `SmartRoute Kano: Success! Waybill ${selectedShipment.id} has been delivered successfully to ${selectedShipment.recipient}. Thank you for shipping with us.`
      };

      const targetPhone = selectedShipment.recipientPhone || selectedShipment.rider.phone || '';
      dispatchSmsNotification({
        waybillId: selectedShipment.id,
        recipient: selectedShipment.recipient,
        phone: targetPhone,
        message: statusMessageTexts[targetStatus]
      });
    }
  };

  // Create Waybill Form Submit
  const handleCreateWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newDestination || !newCargo) {
      alert('Please fill out all cargo registration attributes.');
      return;
    }

    setCreateLoading(true);
    const generatedId = `SRK-TRACK-${Math.floor(100 + Math.random() * 900)}`;
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Assign a beautiful default rider profile based on random selection
    const ridersRoster: RiderMapType[] = [
      {
        name: 'Musa Bello',
        phone: '+234 803 762 9481',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        vehicle: 'Solar cargo tricycle (SRK-TRI-04)',
        license: 'KN-940-A3',
        location: 'In transit corridor approach'
      },
      {
        name: 'Ibrahim Danlami',
        phone: '+234 812 559 3012',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        vehicle: 'Electric Delivery Truck (SRK-EV-02)',
        license: 'KN-222-S8',
        location: 'Loading docks at hub'
      },
      {
        name: 'Aminu Katsina',
        phone: '+234 905 881 7733',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        rating: 5.0,
        vehicle: 'Solar E-Bike Courier (SRK-MOTO-19)',
        license: 'KN-591-B7',
        location: 'Near central terminal route'
      }
    ];
    const chosenRider = ridersRoster[Math.floor(Math.random() * ridersRoster.length)];

    const createdRecord: Omit<DbShipment, 'ownerId' | 'createdAt' | 'updatedAt'> = {
      id: generatedId,
      recipient: newRecipient,
      recipientPhone: newRecipientPhone || '+2348037629481', // load input or Nigerian sandbox phone
      destination: newDestination,
      cargo: newCargo,
      weight: newWeight,
      hub: newHub,
      sender: newSender,
      status: 'Pre-Dispatch',
      otpCode: randomOtp,
      rider: chosenRider,
      timeline: [
        { time: 'Just Now', status: 'Booked', desc: 'Freight routing allocated and queued for dispatch', done: true },
        { time: 'Pending', status: 'Sorted', desc: 'Weight balancing and safety clearance check scheduled', done: false },
        { time: 'Pending', status: 'In Transit', desc: 'Optimization corridor preparation ready', done: false }
      ]
    };

    let creationOk = false;
    if (isCloudMode) {
      try {
        await createShipment(createdRecord);
        creationOk = true;
        setIsCreateOpen(false);
        // Clear forms
        setNewRecipient('');
        setNewRecipientPhone('');
        setNewDestination('');
        setNewCargo('');
      } catch (error: any) {
        alert(`Failed to save to Firestore. Secure rules rejected payload: ${error.message}`);
      } finally {
        setCreateLoading(false);
      }
    } else {
      // Offline Local state append
      const completeLocalRecord: DbShipment = {
        ...createdRecord,
        ownerId: 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setLocalShipments(prev => [completeLocalRecord, ...prev]);
      creationOk = true;
      setSelectedId(generatedId);
      setIsCreateOpen(false);
      setNewRecipient('');
      setNewRecipientPhone('');
      setNewDestination('');
      setNewCargo('');
      setCreateLoading(false);
    }

    if (creationOk) {
      const bookingMessage = `SmartRoute Kano: Waybill ${generatedId} allocated for ${newRecipient}. Cargo: ${newCargo} (${newWeight}) is booked from ${newHub}. Secure Handshake OTP PIN: ${randomOtp}. Track live at: ${window.location.origin}`;
      dispatchSmsNotification({
        waybillId: generatedId,
        recipient: newRecipient,
        phone: newRecipientPhone || '+2348037629481',
        message: bookingMessage
      });
    }
  };

  // Remove Waybill
  const handleDeleteWaybill = async (idToDelete: string) => {
    if (!window.confirm('Are you sure you want to remove this delivery track record?')) return;
    
    if (isCloudMode) {
      try {
        await deleteShipment(idToDelete);
        if (selectedId === idToDelete) {
          setSelectedId('');
        }
      } catch (error: any) {
        alert(`Cloud rules database rejected deletion: ${error.message}`);
      }
    } else {
      setLocalShipments(prev => prev.filter(s => s.id !== idToDelete));
      if (selectedId === idToDelete) {
        setSelectedId('');
      }
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cargo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-200/60 shadow-xl" id="logistics-tracking-dashboard">
      
      {/* CLOUD CONNECT MODULE COMPONENT */}
      <div className="mb-6 bg-slate-50 border border-slate-200/50 rounded-[20px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isCloudMode ? 'bg-emerald-100/80 text-emerald-700' : 'bg-amber-100/80 text-amber-700'}`}>
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800">
                {isCloudMode ? 'Google Firebase Firestore Enabled' : 'Local Sandbox Mode (Read Only)'}
              </h4>
              <span className={`h-1.5 w-1.5 rounded-full ${isCloudMode ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isCloudMode 
                ? `Authorized secure cloud database session as: ${currentUser?.email}`
                : 'Offline sandbox is active. Authenticate below to synchronise with real-time Firestore triggers.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isCloudMode ? (
            <>
              {shipments.length === 0 && (
                <button
                  onClick={handleSeedCollection}
                  disabled={dbLoading}
                  className="px-3.5 py-1.5 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
                  Seed Demo Shipments
                </button>
              )}
              <button
                onClick={handleAuthLogout}
                className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleAuthLogin}
              disabled={dbLoading}
              className="px-4 py-2 text-xs font-extrabold bg-blue-950 hover:bg-blue-900 text-white rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-orange-400" />
              Sign In with Google
            </button>
          )}
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a8a] font-mono">
              Live Control Terminal
            </span>
          </div>
          <h2 className="text-3xl font-black text-blue-950 font-display">Logistics Tracking Base</h2>
          <p className="text-xs text-slate-500 mt-1">Simulate driver coordinates, verify OTP waybill signatures, and manage last-mile corridors dynamically.</p>
        </div>

        {/* Filter / Search input & create buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search Waybill ID or Cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 shadow-md hover:scale-[1.02] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Delivery</span>
          </button>
        </div>
      </div>

      {/* CREATE NEW WAYBILL FORM MODAL DRAWER */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-blue-950">Register New Delivery</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Submit waybill dispatch logs to the persistent {isCloudMode ? 'Firestore DB' : 'local sandbox'}.</p>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 font-bold hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateWaybill} className="space-y-4 mt-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recipient / Client Business</label>
                  <input
                    type="text"
                    required
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="e.g. Alhaji Yusuf & Sons Ltd"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recipient Mobile Number (Africa's Talking SMS Target)</label>
                  <input
                    type="tel"
                    required
                    value={newRecipientPhone}
                    onChange={(e) => setNewRecipientPhone(e.target.value)}
                    placeholder="e.g. +234 803 762 9481"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination Address / Market Corridors</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Kantin Kwari Market, Row D"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Freight Cargo Description</label>
                    <input
                      type="text"
                      required
                      value={newCargo}
                      onChange={(e) => setNewCargo(e.target.value)}
                      placeholder="e.g. Textiles, Grain bags"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Freight Gross Tonnage</label>
                    <input
                      type="text"
                      required
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="e.g. 1,820 kg"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Allocation Origin Hub</label>
                    <select
                      value={newHub}
                      onChange={(e) => setNewHub(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                    >
                      <option value="Dala Dry Port Hub">Dala Dry Port Hub</option>
                      <option value="Nassarawa Grain Hub">Nassarawa Grain Hub</option>
                      <option value="Kano Central Terminal">Kano Central Terminal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary Supplying Agency</label>
                    <input
                      type="text"
                      required
                      value={newSender}
                      onChange={(e) => setNewSender(e.target.value)}
                      placeholder="Northern Grains Corp"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-950 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3 bg-blue-950 hover:bg-blue-900 border text-white rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {createLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-orange-400" />
                      Create Secure Docket
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Waybills & Selected Shipment Metadata (Grid Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Active Waybills ({filteredShipments.length})
            </span>
            {dbLoading && (
              <span className="text-[10px] text-blue-900 animate-pulse flex items-center gap-1 font-mono">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                Query sync...
              </span>
            )}
          </div>

          {/* Delivery cards roster */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                {dbLoading ? 'Fetching Secure Waybills...' : 'No matching waybills found in this region.'}
              </div>
            ) : (
              filteredShipments.map(s => {
                const isActive = s.id === selectedId;
                return (
                  <div
                    key={s.id}
                    className="relative group transition-all"
                  >
                    <button
                      onClick={() => {
                        setSelectedId(s.id);
                        setOtpError(null);
                        setOtpInput('');
                      }}
                      className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer block relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-950 to-blue-900 text-white border-blue-950 shadow-md'
                          : 'bg-slate-50/50 hover:bg-slate-50 text-slate-800 border-slate-100'
                      }`}
                    >
                      {/* Tiny glowing bar */}
                      {isActive && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-orange-500"></div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                            isActive ? 'text-orange-400' : 'text-blue-900'
                          }`}>
                            {s.id}
                          </span>
                          <h4 className="font-bold text-sm leading-tight mt-1 truncate max-w-[140px] sm:max-w-[180px]">
                            {s.recipient}
                          </h4>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          s.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.status === 'In Transit'
                            ? 'bg-amber-500/20 text-orange-400'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-2 border-t pt-2.5 border-dashed border-slate-200/10">
                        <div>
                          <p className={`text-[8px] font-bold uppercase ${isActive ? 'text-blue-200/50' : 'text-slate-400'}`}>Cargo</p>
                          <p className="text-[11px] font-medium truncate">{s.cargo}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[8px] font-bold uppercase ${isActive ? 'text-blue-200/50' : 'text-slate-400'}`}>Target Depot</p>
                          <p className="text-[11px] font-medium truncate">{s.destination.split(',')[0]}</p>
                        </div>
                      </div>
                    </button>

                    {/* Delete action trigger icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWaybill(s.id);
                      }}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all cursor-pointer shadow-xs"
                      title="Delete Waybill Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* SENDER / DEPOT DETAILS BLOCK */}
          {selectedShipment && (
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2 text-xs">
              <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider font-mono">Consignment Log Details</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Shipper Agency</span>
                  <span className="font-semibold text-slate-700 truncate block">{selectedShipment.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Allocated Hub</span>
                  <span className="font-semibold text-slate-700 truncate block">{selectedShipment.hub}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Cargo Net Tonnage</span>
                  <span className="font-semibold text-slate-700 truncate block">{selectedShipment.weight}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Waybill Handshake</span>
                  <span className="font-mono font-bold text-orange-600 block">OTP REQUIRED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE PANEL: Interactive Google Maps placeholder (Grid Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Google Maps Interactive Live Feed
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setMapMode('vector')}
                className={`px-2 py-1 text-[9px] font-extrabold rounded ${
                  mapMode === 'vector' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Roadmap
              </button>
              <button 
                onClick={() => setMapMode('satellite')}
                className={`px-2 py-1 text-[9px] font-extrabold rounded ${
                  mapMode === 'satellite' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Satellite
              </button>
              <button 
                onClick={() => setMapMode('traffic')}
                className={`px-2 py-1 text-[9px] font-extrabold flex items-center gap-1 rounded ${
                  mapMode === 'traffic' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                Traffic
              </button>
            </div>
          </div>

          {/* Google Maps Visual Mock Frame */}
          <div className={`relative h-[310px] rounded-[24px] overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 ${
            mapMode === 'satellite' ? 'bg-slate-900' : 'bg-[#e5e9f0]'
          }`}>
            
            {/* Custom high contrast schematic grid to mimic maps */}
            {mapMode === 'vector' && (
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]"></div>
            )}
            
            {/* Realistic Google Maps Overlays / Controls */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-semibold text-slate-800 shadow-lg border border-slate-100 max-w-[210px] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-blue-900 animate-spin" />
              <div>
                <p className="font-bold text-[9px] uppercase tracking-tighter text-slate-400">Live GPS Coordinates</p>
                <p className="font-mono text-slate-700 truncate">12.0022° N, 8.5920° E</p>
              </div>
            </div>

            {/* Google Compass Dial layout inside placeholder */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-600">
              <button onClick={() => setMapZoom(z => Math.min(20, z+1))} className="w-6 h-6 flex items-center justify-center font-bold text-xs hover:bg-slate-100 rounded">+</button>
              <hr className="border-slate-200" />
              <button onClick={() => setMapZoom(z => Math.max(10, z-1))} className="w-6 h-6 flex items-center justify-center font-bold text-xs hover:bg-slate-100 rounded">-</button>
            </div>

            {/* SVG Visual Map Track Overlay */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Traffic congestions overlay */}
              {mapMode === 'traffic' && (
                <>
                  <path d="M 50 140 Q 150 160 250 140 T 350 140" fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.35" strokeLinecap="round" className="animate-pulse" />
                  <path d="M 50 140 Q 150 160 250 140 T 350 140" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                  <text x="200" y="125" textAnchor="middle" className="text-[8px] font-bold fill-red-800 bg-red-100">Bypass congestion active</text>
                </>
              )}

              {/* Grid Lines resembling city layout paths */}
              <path d="M-20,150 L520,150 M120,-20 L120,400 M320,-20 L320,400" stroke={mapMode === 'satellite' ? '#1e293b' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M-20,80 L520,240" stroke={mapMode === 'satellite' ? '#1e293b' : '#cbd5e1'} strokeWidth="2" />
              <path d="M 50,-20 C 180,180 200,80 340,320" stroke={mapMode === 'satellite' ? '#334155' : '#94a3b8'} strokeWidth="3" fill="none" />

              {/* Transit Tracker Route Overlay line */}
              <path 
                d="M 120,80 Q 200,160 280,150 T 320,260" 
                fill="none" 
                stroke="#1e3a8a" 
                strokeWidth="5" 
                strokeLinecap="round" 
                opacity="0.8"
              />
              <path 
                d="M 120,80 Q 200,160 280,150 T 320,260" 
                fill="none" 
                stroke="#ea580c" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeDasharray="14 100"
                strokeDashoffset={-simulatedTransitProgress * 2.5}
              />

              {/* Origin Warehouse marker point */}
              <g transform="translate(120, 80)">
                <circle r="12" fill="#1e3a8a" opacity="0.2" className="animate-pulse" />
                <circle r="6" fill="#1e3a8a" />
                <rect x="-35" y="-22" width="70" height="11" rx="3" fill="#1e3a8a" />
                <text x="0" y="-14" textAnchor="middle" className="text-[7px] font-sans font-extrabold fill-white">DALA_DEPOT</text>
              </g>

              {/* Live moving dispatch driver coordinate visual container */}
              <g transform={`translate(${120 + (320 - 120) * (simulatedTransitProgress / 100)}, ${80 + (260 - 80) * (simulatedTransitProgress / 100)})`}>
                <circle r="14" fill="#f97316" opacity="0.25" className="animate-ping" />
                <path d="M12 -12 L0 0 L-12 -12" fill="none" />
                <circle r="7" fill="#ea580c" stroke="#fff" strokeWidth="2" />
                {/* Micro vehicle visual representation inside map point */}
                <circle r="2.5" fill="#fff" />
              </g>

              {/* Destination customer drop node */}
              <g transform="translate(320, 260)">
                <circle r="14" fill="#ea580c" opacity="0.15" />
                <circle r="6" fill="#ea580c" />
                <rect x="-35" y="10" width="70" height="11" rx="3" fill="#334155" />
                <text x="0" y="18" textAnchor="middle" className="text-[7px] font-sans font-extrabold fill-white uppercase">CUSTOMER_HUB</text>
              </g>
            </svg>

            {/* Bottom mini status overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-mono text-white flex items-center gap-2.5 max-w-xs uppercase tracking-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Rider location updated {simulatedTransitProgress % 4}s ago</span>
            </div>

            {/* Google brand attribution badge */}
            <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-slate-500">
              Google Maps
            </div>
          </div>

          {/* RIDER INTEGRITY WIDGET CARD */}
          {selectedShipment && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedShipment.rider.avatar} 
                    alt={selectedShipment.rider.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-orange-500 shadow-sm shrink-0" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-800 text-sm">{selectedShipment.rider.name}</h5>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 bg-amber-50 px-1 py-0.2 rounded font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                        {selectedShipment.rider.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{selectedShipment.rider.vehicle}</p>
                    <p className="text-[10px] text-slate-400 font-mono">License: {selectedShipment.rider.license}</p>
                  </div>
                </div>

                {/* Dispatch Action Panel */}
                <div className="flex gap-2 sm:ml-auto">
                  <a 
                    href={`tel:${selectedShipment.rider.phone}`}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs text-xs font-semibold text-slate-700"
                    title="Call Carrier"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-900" />
                    <span>Call Rider</span>
                  </a>
                  <button 
                    onClick={() => alert(`Simulated Chat interface opened. Conversation started with dispatcher ${selectedShipment.rider.name}`)}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs text-xs font-semibold text-slate-700"
                    title="Message Carrier"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
              
              {/* Rider last location telemetry line */}
              <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between text-[11px] text-slate-500">
                <span>Rider Status: <span className="font-semibold text-orange-600">{selectedShipment.rider.location}</span></span>
                <span className="font-mono text-slate-400 uppercase">GPS Node Secure</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Timeline Progress & Secure OTP input system (Grid Span 3) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          
          {/* SHIPMENT TIMELINE WIDGET */}
          {selectedShipment ? (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-3">
                Shipment Mileposts
              </span>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                {selectedShipment.timeline.map((mile, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {/* Milestones state indicator circle */}
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 z-10 transition-colors ${
                      mile.done 
                      ? 'bg-blue-900 text-white shadow-xs border-2 border-orange-500' 
                      : i === selectedShipment.timeline.filter(t=>t.done).length
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                    }`}>
                      {mile.done ? '✓' : i + 1}
                    </div>

                    <div className="space-y-0.5 leading-tight">
                      <div className="flex items-baseline gap-1.5">
                        <h5 className={`text-xs font-bold ${mile.done ? 'text-slate-800' : 'text-slate-400'}`}>
                          {mile.status}
                        </h5>
                        <span className="text-[9px] text-slate-400 font-mono font-medium">{mile.time}</span>
                      </div>
                      <p className={`text-[10px] sm:text-[11px] leading-snug ${mile.done ? 'text-slate-600' : 'text-slate-400'}`}>
                        {mile.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No shipment selected.
            </div>
          )}

          {/* SECURE OTP HANDSHAKE PANEL */}
          {selectedShipment && (
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-[24px] p-5 shadow-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#eff6ff] font-mono">
                    Waybill Handshake
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.2 rounded">
                  SECURE-CORE
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Confirm deliverable handover under secure ledger protocol. Submit the matching 4-digit token.
                </p>
                
                {/* Recipient Helper Simulator Box showing actual code */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 mt-2.5 flex justify-between items-center text-[11px] text-slate-350">
                  <span>Passkey Token (Sandbox info):</span>
                  <span className="font-mono font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded tracking-widest">
                    {selectedShipment.otpCode}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedShipment.status === 'Delivered' ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center text-emerald-400 text-xs font-semibold space-y-1"
                  >
                    <CheckCircle className="w-5 h-5 mx-auto text-emerald-400" />
                    <p>Handshake Authorized</p>
                    <p className="text-[10px] text-emerald-500/70 font-mono uppercase font-bold">Consignment Delivered</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/\D/g, ''));
                          setOtpError(null);
                        }}
                        placeholder="e.g. 1234"
                        required
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center text-white text-base font-mono tracking-widest focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-white/30"
                      />

                      <button
                        type="submit"
                        disabled={otpSuccess}
                        className="px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>

                    {otpError && (
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-red-400 font-medium leading-snug flex items-start gap-1 p-1 bg-red-500/10 rounded border border-red-500/10"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        <span>{otpError}</span>
                      </motion.p>
                    )}
                  </form>
                )}
              </AnimatePresence>
              
              <div className="text-[10px] text-slate-500 text-center flex justify-between border-t border-slate-800/80 pt-2.5">
                <span>Waybill Code match</span>
                <span className="font-mono text-orange-400">SRK-100% SECURE</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* QUICK STATUS OVERRIDE CONTROLLER BAR - Admin override for sandbox testing */}
      {selectedShipment && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-900" />
            <span className="font-bold text-slate-700">Sandbox Dispatch Override Controls:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Pre-Dispatch', 'In Transit', 'Out for Delivery', 'Delivered'] as const).map(st => {
              const isCurrent = selectedShipment.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusProgress(st)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                    isCurrent 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-slate-50 hover:bg-slate-150 text-slate-600 border border-slate-200/50'
                  }`}
                >
                  Set: {st}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AFRICA'S TALKING SMS INTEGRATION CONTROL CENTER */}
      <div className="mt-8 pt-8 border-t border-slate-200" id="africas-talking-sms-integration">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-900 font-mono">
                Outbound Carrier Gateway
              </span>
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500 animate-bounce" />
              Africa's Talking SMS Logs & Settings Center
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure or simulate outbound carrier-grade SMS notifications for high-efficiency dispatching loop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${
              smsConfig.isLiveActive 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${smsConfig.isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {smsConfig.isLiveActive ? `Live Outbound SMS Active` : 'Sandbox Simulator Mode'}
            </span>
            
            <button
              onClick={() => setIsOverrideOpen(!isOverrideOpen)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-orange-400" />
              {isOverrideOpen ? 'Hide Credentials' : 'Override API Credentials'}
            </button>
          </div>
        </div>

        {/* Credentials Settings Tray */}
        {isOverrideOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Interactive API Configurations (Proxy Credentials)
              </h4>
              <span className="text-[10px] text-slate-400">Stored safely in local web storage</span>
            </div>
            <p className="text-xs text-slate-600">
              Paste your actual credentials to trigger **real outbound Carrier SMS**! Keep them blank to fall back to simulated developer logs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AT Username</label>
                <input
                  type="text"
                  placeholder="e.g. sandbox or mycompany"
                  value={overrideUsername}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOverrideUsername(val);
                    localStorage.setItem('at_override_username', val);
                  }}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-none placeholder-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AT Secret API Key</label>
                <input
                  type="password"
                  placeholder="e.g. ddb0234a9..."
                  value={overrideApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOverrideApiKey(val);
                    localStorage.setItem('at_override_apikey', val);
                  }}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-none placeholder-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AT Sender ID / Alphanumeric ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MYCOMPANY"
                  value={overrideSenderId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOverrideSenderId(val);
                    localStorage.setItem('at_override_senderid', val);
                  }}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-none placeholder-slate-300"
                />
              </div>
            </div>
            {overrideUsername && overrideApiKey && (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ✔ Credentials Override Saved. Dispatched alerts will transmit as real international carrier SMS.
              </p>
            )}
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  setOverrideUsername('');
                  setOverrideApiKey('');
                  setOverrideSenderId('');
                  localStorage.removeItem('at_override_username');
                  localStorage.removeItem('at_override_apikey');
                  localStorage.removeItem('at_override_senderid');
                  setIsOverrideOpen(false);
                }}
                className="px-3 py-1.5 text-red-650 border border-red-200 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              >
                Reset Override Settings
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Quick manual SMS sender panel */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono pb-2 border-b border-slate-200 flex justify-between items-center">
              <span>Send Manual SMS Dispatch</span>
              <Send className="w-3.5 h-3.5 text-slate-400" />
            </h4>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!customSmsPhone || !customSmsMessage) return;
                setIsSmsSending(true);
                setSmsStatusMessage(null);
                
                try {
                  const data = await dispatchSmsNotification({
                    waybillId: selectedShipment?.id || 'SRK-MANUAL',
                    recipient: selectedShipment?.recipient || 'Manual Carrier Test Receiver',
                    phone: customSmsPhone,
                    message: customSmsMessage
                  });
                  if (data?.success) {
                    setSmsStatusMessage({ text: 'SMS transmitted successfully!', isError: false });
                    setCustomSmsMessage('');
                  } else {
                    setSmsStatusMessage({ text: data?.error || 'Failed sending carrier message.', isError: true });
                  }
                } catch (err: any) {
                  setSmsStatusMessage({ text: `Connection issue: ${err.message}`, isError: true });
                } finally {
                  setIsSmsSending(false);
                }
              }} 
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +2348037629481"
                  value={customSmsPhone}
                  onChange={(e) => setCustomSmsPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Specify in international format (+234...)</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">TextMessage Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type payload text here..."
                  value={customSmsMessage}
                  onChange={(e) => setCustomSmsMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 resize-none"
                />
              </div>

              {selectedShipment && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSmsPhone(selectedShipment.recipientPhone || selectedShipment.rider.phone || '');
                      setCustomSmsMessage(`SmartRoute Kano: Secure cargo verification OTP code for Waybill ${selectedShipment.id} is [${selectedShipment.otpCode || '4821'}]. Confirm delivery receipt on-site.`);
                    }}
                    className="text-[10px] text-blue-900 hover:underline font-mono"
                  >
                    ⚡ Load Selected Waybill OTP Template
                  </button>
                </div>
              )}

              {smsStatusMessage && (
                <div className={`p-2.5 rounded-lg text-[11px] font-medium ${
                  smsStatusMessage.isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }`}>
                  {smsStatusMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSmsSending}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-1 h-9"
              >
                {isSmsSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Transmitting Carrier Data...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Transmit SMS Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: SMS logs audit trails table */}
          <div className="lg:col-span-8 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>SMS Gateway Delivery Logs Audit Trail ({smsLogs.length})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await clearSmsLogs();
                    loadSmsLogsAndConfig();
                  }}
                  className="text-[10px] text-red-650 hover:underline cursor-pointer"
                >
                  Clear logs
                </button>
                <button
                  onClick={loadSmsLogsAndConfig}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-all cursor-pointer"
                  title="Force Refresh Logger"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-900" />
                </button>
              </div>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[340px] overflow-y-auto">
              {smsLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No SMS transmissions captured since server start.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {smsLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-50 transition-all text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-[10px] text-[#1e3a8a] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {log.waybillId}
                          </span>
                          <span className="font-semibold text-slate-700">{log.recipient}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{log.destinationPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            log.status === 'sent' || log.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'simulated'
                              ? 'bg-blue-50 text-blue-850 border border-blue-100'
                              : 'bg-red-50 text-red-800 border border-red-100'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-450 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-6 tracking-wide font-sans mb-1 bg-slate-50/50 p-1.5 rounded border border-slate-100">{log.message}</p>
                      <div className="text-[9px] text-slate-400 font-mono truncate flex items-center gap-1">
                        <span className="font-semibold text-slate-500 shrink-0">Carrier Gateway feedback:</span>
                        <span className="truncate">{log.gatewayResponse}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
              <span>Automatic real-time polling active (every 15 seconds)</span>
              <span>AT Carrier Integration: Version 1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
