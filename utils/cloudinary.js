const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const memoryStorage = multer.memoryStorage();

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// ─── ARTIST PHOTO ───
const uploadArtistPhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'), false);
  },
}).single('photo');

async function processArtistPhoto(file) {
  return uploadBuffer(file.buffer, {
    folder: 'nr40/artists',
    transformation: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto:good' }],
  });
}

// ─── BOOKING FILES ───
const uploadBookingFiles = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, PDF allowed'), false);
  },
}).array('attachments', 5);

async function processBookingFile(file) {
  const isPdf = file.mimetype === 'application/pdf';
  return uploadBuffer(file.buffer, {
    folder: 'nr40/bookings',
    resource_type: isPdf ? 'raw' : 'image',
    ...(isPdf ? {} : { transformation: [{ quality: 'auto:good' }] }),
  });
}

// ─── GALLERY PHOTO ───
const uploadGalleryPhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'), false);
  },
}).single('photo');

// type = 'tattoo' | 'studio'
async function processGalleryPhoto(file, type) {
  const isStudio = type === 'studio';
  return uploadBuffer(file.buffer, {
    folder: `nr40/gallery/${type}`,
    transformation: isStudio
      ? [{ width: 1400, height: 1000, crop: 'limit', quality: 'auto:good' }]
      : [{ width: 1000, height: 1200, crop: 'limit', quality: 'auto:good' }],
  });
}

// ─── DELETE ───
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = {
  uploadArtistPhoto,
  processArtistPhoto,
  uploadBookingFiles,
  processBookingFile,
  uploadGalleryPhoto,
  processGalleryPhoto,
  deleteFromCloudinary,
};