/**
 * CargoShare AI - Admin Data Synchronization Utility
 * Automatically synchronizes exporter, carrier, commission, and booking details
 * to the Admin Dashboard whenever a space is booked or registered.
 */

// Helper to safely parse localStorage items
export function getLocalStorageItem(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

// Helper to safely write localStorage items and notify listeners
export function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time reactive updates within the same window
    window.dispatchEvent(new CustomEvent('cargoshare_data_synced', { detail: { key, value } }));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

/**
 * Automatically syncs an entire booking into:
 * 1. cargoshare_bookings
 * 2. cargoshare_exporters (auto-adds or updates exporter profile)
 * 3. cargoshare_carriers (auto-adds or updates carrier profile)
 * 4. cargoshare_commissions (auto-generates 5% commission record)
 */
export function syncBookingToAdmin(booking) {
  if (!booking) return;

  const totalAmount = Number(booking.totalAmount) || 
    (Number(booking.cbm || 1) * 520 * 1.18 + 1650);
  const advanceAmount = Number(booking.advanceAmount || booking.amountPaid) || Math.round(totalAmount * 0.25);
  const balanceAmount = Number(booking.balanceAmount) !== undefined 
    ? Number(booking.balanceAmount) 
    : Math.max(0, totalAmount - advanceAmount);

  const exporterName = (booking.exporterName || 'Apex Exports SME').trim();
  const exporterEmail = (booking.email || 'logistics@' + exporterName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com').trim();
  const carrierName = (booking.carrier || 'Oceanic Freight Ltd.').trim();
  const carrierClean = carrierName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const carrierEmail = `dispatch@${carrierClean || 'oceanicfreight'}.com`;
  const route = booking.route || 'Port Route';
  const cbm = Number(booking.cbm) || 1;
  const commodity = booking.commodity || 'General Freight';
  const bookingDate = booking.date || new Date().toISOString().split('T')[0];
  const bookingId = booking.id || `CS-${Date.now().toString().slice(-4)}`;
  const txnId = booking.transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  // 1. Sync Booking into cargoshare_bookings
  const existingBookings = getLocalStorageItem('cargoshare_bookings', []);
  const bookingIndex = existingBookings.findIndex(b => b.id === bookingId);
  
  const normalizedBooking = {
    ...booking,
    id: bookingId,
    exporterName,
    email: exporterEmail,
    carrier: carrierName,
    route,
    cbm,
    commodity,
    totalAmount,
    advanceAmount,
    balanceAmount,
    amountPaid: advanceAmount,
    date: bookingDate,
    transactionId: txnId,
    status: booking.status || 'Pending Confirmation',
    paymentStatus: booking.paymentStatus || 'Advance Paid (25%)',
    paymentMethod: booking.paymentMethod || 'UPI QR Scanner'
  };

  let updatedBookings;
  if (bookingIndex >= 0) {
    updatedBookings = [...existingBookings];
    updatedBookings[bookingIndex] = { ...updatedBookings[bookingIndex], ...normalizedBooking };
  } else {
    updatedBookings = [normalizedBooking, ...existingBookings];
  }
  setLocalStorageItem('cargoshare_bookings', updatedBookings);

  // 2. Sync Exporter into cargoshare_exporters
  const existingExporters = getLocalStorageItem('cargoshare_exporters', []);
  const exporterIndex = existingExporters.findIndex(e => 
    (e.name && e.name.toLowerCase() === exporterName.toLowerCase()) || 
    (e.email && e.email.toLowerCase() === exporterEmail.toLowerCase())
  );

  const routeOriginCity = route.split('→')[0].split('(')[0].trim() || 'India';

  if (exporterIndex >= 0) {
    const existing = existingExporters[exporterIndex];
    const prevCbm = Number(existing.totalCbm) || 0;
    const prevSpendNum = Number(String(existing.totalSpend || '').replace(/[^0-9.]/g, '')) || 0;
    
    existingExporters[exporterIndex] = {
      ...existing,
      bookingsCount: (Number(existing.bookingsCount) || 1) + 1,
      totalCbm: prevCbm + cbm,
      totalSpend: `₹${(prevSpendNum + totalAmount).toLocaleString()}`,
      commodity: existing.commodity || commodity,
      city: existing.city || routeOriginCity,
      status: 'Active'
    };
    setLocalStorageItem('cargoshare_exporters', existingExporters);
  } else {
    const newExporter = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      name: exporterName,
      contactPerson: booking.contactPerson || exporterName,
      email: exporterEmail,
      city: routeOriginCity,
      commodity: commodity,
      bookingsCount: 1,
      totalCbm: cbm,
      totalSpend: `₹${totalAmount.toLocaleString()}`,
      status: 'Active'
    };
    setLocalStorageItem('cargoshare_exporters', [newExporter, ...existingExporters]);
  }

  // 3. Sync Carrier into cargoshare_carriers
  const existingCarriers = getLocalStorageItem('cargoshare_carriers', []);
  const carrierIndex = existingCarriers.findIndex(c => 
    c.name && c.name.toLowerCase() === carrierName.toLowerCase()
  );

  if (carrierIndex >= 0) {
    const existing = existingCarriers[carrierIndex];
    const existingRoutes = existing.routes || '';
    const updatedRoutes = existingRoutes.includes(route) 
      ? existingRoutes 
      : (existingRoutes ? `${existingRoutes}, ${route}` : route);

    existingCarriers[carrierIndex] = {
      ...existing,
      routes: updatedRoutes,
      activeListings: (Number(existing.activeListings) || 1) + 1,
      status: 'Verified Partner'
    };
    setLocalStorageItem('cargoshare_carriers', existingCarriers);
  } else {
    const carrierCode = (carrierName.substring(0, 3) || 'CAR').toUpperCase();
    const newCarrier = {
      id: `CAR-${Math.floor(500 + Math.random() * 500)}`,
      name: carrierName,
      code: carrierCode,
      fmcLicense: `FMC-${Math.floor(10000 + Math.random() * 90000)}`,
      imoCompany: `IMO-${Math.floor(1000000 + Math.random() * 9000000)}`,
      headquarters: `${routeOriginCity} Port Terminal Hub`,
      email: carrierEmail,
      fleetSize: 3,
      spacePosted: `${(cbm + 12000).toLocaleString()} CBM`,
      routes: route,
      status: 'Verified Partner',
      activeListings: 1,
      rating: '4.9/5',
      onTimeRate: '98.5%',
      vessels: [
        { 
          name: booking.vessel || `${carrierName.split(' ')[0]} Pioneer`, 
          imo: 'IMO 9821044', 
          capacity: '12,000 CBM', 
          type: 'Container Vessel', 
          flag: 'India' 
        }
      ]
    };
    setLocalStorageItem('cargoshare_carriers', [newCarrier, ...existingCarriers]);
  }

  // 4. Sync Commission into cargoshare_commissions
  const existingCommissions = getLocalStorageItem('cargoshare_commissions', []);
  const commissionIndex = existingCommissions.findIndex(c => c.bookingId === bookingId);

  const commissionRate = 5.0; // 5% Take rate
  const commissionAmount = Math.round(totalAmount * (commissionRate / 100));
  const carrierPayout = totalAmount - commissionAmount;

  const commissionRecord = {
    id: `COM-${Math.floor(500 + Math.random() * 500)}`,
    bookingId: bookingId,
    carrier: carrierName,
    carrierCode: (carrierName.substring(0, 3) || 'CAR').toUpperCase(),
    carrierAccount: `HDFC ESCROW / ${carrierName.split(' ')[0].toUpperCase()}`,
    exporter: exporterName,
    route: route,
    cbm: cbm,
    grossAmount: totalAmount,
    advancePaid: advanceAmount,
    balancePaid: balanceAmount,
    ratePercent: commissionRate,
    commissionAmount: commissionAmount,
    carrierPayout: carrierPayout,
    status: 'Held in Escrow',
    escrowStage: '25% Advance Secured in Smart Escrow (Awaiting Carrier Approval)',
    utr: txnId,
    date: bookingDate,
    gstInvoiceRef: `INV-CS-2026-${Math.floor(100 + Math.random() * 900)}`
  };

  if (commissionIndex >= 0) {
    existingCommissions[commissionIndex] = { ...existingCommissions[commissionIndex], ...commissionRecord };
    setLocalStorageItem('cargoshare_commissions', existingCommissions);
  } else {
    setLocalStorageItem('cargoshare_commissions', [commissionRecord, ...existingCommissions]);
  }
}

/**
 * Sync all bookings (e.g. from backend API or state) into admin directories
 * to ensure no exporter or carrier is missing from the Admin Dashboard.
 */
export function autoSyncAllBookingsToAdmin(bookingsList = []) {
  if (!Array.isArray(bookingsList) || bookingsList.length === 0) return;
  bookingsList.forEach(booking => {
    syncBookingToAdmin(booking);
  });
}
