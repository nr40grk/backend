const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── ARTIST PORTFOLIO STORAGE ───
const artistStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'inktemple/artists',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto:good' }],
  },
});

// ─── BOOKING ATTACHMENT STORAGE ───
const bookingStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'inktemple/bookings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
    transformation: [{ quality: 'auto:good' }],
  },
});

const uploadArtistPhoto = multer({
  storage: artistStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'), false);
  },
}).single('photo');

const uploadBookingFiles = multer({
  storage: bookingStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, PDF allowed'), false);
  },
}).array('attachments', 5);

async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadArtistPhoto, uploadBookingFiles, deleteFromCloudinary };