let fallbackSpaces = [
  {
    id: 'SP-5001',
    vessel: 'MSC Oscar',
    carrier: 'Oceanic Freight Ltd.',
    origin: 'innsa',
    dest: 'inmun',
    date: '2026-09-01',
    capacity: 250,
    available: 180,
    price: 450,
    status: 'Available',
    createdAt: new Date()
  },
  {
    id: 'SP-5002',
    vessel: 'Ever Given',
    carrier: 'Maersk Logistics',
    origin: 'inmaa',
    dest: 'inccu',
    date: '2026-09-05',
    capacity: 400,
    available: 320,
    price: 520,
    status: 'Available',
    createdAt: new Date()
  }
];
let fallbackBookings = [
  {
    id: 'CS-1001',
    spaceId: 'SP-5001',
    route: 'innsa to inmun',
    carrier: 'Oceanic Freight Ltd.',
    exporterName: 'Apex Textiles SME',
    cbm: 25,
    commodity: 'Garments',
    weight: 4200,
    specialReq: 'Keep dry',
    status: 'Pending Confirmation',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date()
  }
];
 module.exports = {fallbackSpaces, fallbackBookings};