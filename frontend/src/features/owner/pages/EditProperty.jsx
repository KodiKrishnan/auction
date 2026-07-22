import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Autocomplete,
  Stepper, Step, StepLabel, IconButton,
  LinearProgress, Stack, Tooltip, MenuItem, Skeleton, Dialog
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';

import {
  CloudUpload as CloudUploadIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowBack as ArrowBackIcon,
  Bed as BedIcon,
  People as PeopleIcon,
  MyLocation as LocationIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  Close as CloseIcon,
  Videocam as VideoIcon
} from "@mui/icons-material";

import DefaultAmenityIcon from "@mui/icons-material/CheckCircleOutlined";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Contexts & Hooks
import { useLoader } from "../../../context/LoaderContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";
import { useError } from "../../../context/ErrorContext";

import {
  fetchPropertyTypes,
  fetchLocations,
  fetchAmenities,
  fetchPropertyById,
  updateProperty,
  deletePropertyImage,
  fetchUploadImages,
  updatePrimaryImage,
  fetchUploadVideo,
  deletePropertyVideo
} from "../ownerAPI";

// Validation
import { validate } from '../../../utils/validators/validate';
import { propertyListingSchema } from "../../../utils/validators/schemas";

const STEPS = [
  { label: 'Property Basics', description: 'Name, type, and description' },
  { label: 'Location', description: 'Country, state, and city' },
  { label: 'Spaces & Amenities', description: 'Capacity and features' },
  { label: 'Media', description: 'Photos and video' },
];

const premiumTextField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "#F9FAFB",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: "#F3F4F6"
    },
    "&.Mui-focused": {
      bgcolor: "white",
      boxShadow: "0 0 0 4px rgba(94, 53, 177, 0.15)",
      borderColor: "transparent"
    }
  }
};

const readOnlyTextField = {
  ...premiumTextField,
  "& .MuiOutlinedInput-root": {
    ...premiumTextField["& .MuiOutlinedInput-root"],
    bgcolor: "#F3F4F6",
    "&:hover fieldset": { borderColor: "#E5E7EB" },
    "&.Mui-focused fieldset": { borderColor: "#E5E7EB", borderWidth: "1px" },
  },
  "& input": {
    color: "#6B7280",
    cursor: "not-allowed",
    WebkitTextFillColor: "#6B7280",
    caretColor: "transparent"
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    bgcolor: "#F3F4F6",
    boxShadow: "none"
  }
};

const editableWhiteField = {
  ...premiumTextField,
  "& .MuiOutlinedInput-root": {
    ...premiumTextField["& .MuiOutlinedInput-root"],
    bgcolor: "white",
  }
};

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://auction-api.theshortlistd.org";

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('http')) return path;

  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = formattedPath.replace(/\\/g, '/');

  return `${BACKEND_URL}${cleanPath}`;
};

// GOOGLE MAPS SERVICE HELPER (Loaded once globally) 
const autocompleteService = { current: null };



function PillSelector({ options, value, onChange, multi = false }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {options.map((opt) => {
        const isSelected = multi ? value.includes(opt.id) : value === opt.id;
        const displayLabel = opt.name || opt.label;

        return (
          <Box
            key={opt.id}
            onClick={() => {
              if (multi) { onChange(isSelected ? value.filter(v => v !== opt.id) : [...value, opt.id]); }
              else { onChange(opt.id); }
            }}
            sx={{
              display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, border: "1.5px solid",
              borderColor: isSelected ? theme.palette.primary.main : "#E5E7EB", borderRadius: "12px", cursor: "pointer",
              background: isSelected ? theme.palette.primary.main : "white", color: isSelected ? "white" : "#4B5563",
              fontWeight: isSelected ? 600 : 500, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isSelected ? "0 4px 12px rgba(94, 53, 177, 0.25)" : "0 2px 4px rgba(0,0,0,0.02)",
              "&:hover": { borderColor: theme.palette.primary.main, transform: "translateY(-2px)", boxShadow: isSelected ? "0 6px 16px rgba(94, 53, 177, 0.3)" : "0 4px 10px rgba(0,0,0,0.08)" }
            }}
          >
            {opt.iconUrl && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img
                  src={opt.iconUrl}
                  alt={displayLabel}
                  style={{ width: 20, height: 20, objectFit: "contain", filter: isSelected ? "brightness(0) invert(1)" : "none" }}
                />
              </Box>
            )}
            {displayLabel}
          </Box>
        );
      })}
    </Box>
  );
}

function CounterField({ label, icon, value, onChange, min = 0, max = 20 }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid #F3F4F6' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: '#9CA3AF', display: 'flex', p: 1, borderRadius: 2, bgcolor: '#F9FAFB' }}>{icon}</Box>
        <Typography variant="body1" fontWeight={500} color="#111827">{label}</Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} sx={{ border: "1px solid #E5E7EB", "&:hover": { borderColor: theme.palette.primary.main, bgcolor: "transparent" } }}>
          <Typography variant="body1" sx={{ lineHeight: 1 }}>−</Typography>
        </IconButton>
        <Typography variant="h6" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{value}</Typography>
        <IconButton size="small" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} sx={{ border: "1px solid #E5E7EB", "&:hover": { borderColor: theme.palette.primary.main, bgcolor: "transparent" } }}>
          <Typography variant="body1" sx={{ lineHeight: 1 }}>+</Typography>
        </IconButton>
      </Stack>
    </Box>
  );
}

// INTERNAL VIDEO UPLOADER COMPONENT 
function VideoUploader({ video, setVideo, onRemoveExisting }) {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB Limit
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!validTypes.includes(file.type)) {
      alert('Invalid video format. Please upload MP4, WebM, or MOV.');
      return;
    }

    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 50MB.');
      return;
    }

    setVideo({
      file: file,
      url: URL.createObjectURL(file),
      isExisting: false
    });
  };

  const removeVideo = () => {
    // If it's an existing video from the backend, mark it for deletion
    if (video?.isExisting && onRemoveExisting) {
      onRemoveExisting();
    } else if (video?.url) {
      // If it's a local blob, free up browser memory
      URL.revokeObjectURL(video.url);
    }
    setVideo(null);
  };

  return (
    <Box mt={4}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>Video Walkthrough (Optional)</Typography>
      {!video ? (
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false);
            handleVideoUpload({ target: { files: e.dataTransfer.files } });
          }}
          sx={{
            border: "2px dashed", borderColor: dragging ? theme.palette.primary.main : "#E5E7EB",
            borderRadius: 4, py: 6, px: 3, textAlign: "center", bgcolor: dragging ? theme.palette.primary.light + "20" : "#F9FAFB",
            cursor: "pointer", transition: "all 0.2s", position: "relative", "&:hover": { borderColor: theme.palette.primary.main, bgcolor: theme.palette.primary.light + "10" }
          }}
        >
          <input type="file" accept="video/mp4,video/webm,video/quicktime" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} onChange={handleVideoUpload} />
          <VideoIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" sx={{ color: "#111827", mb: 0.5, fontWeight: 700, fontSize: "1rem" }}>Upload a Video Walkthrough</Typography>
          <Typography variant="body2" color="text.secondary">MP4, WebM up to 50MB</Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: '1px solid #E5E7EB', bgcolor: 'black' }}>
          <video
            src={video.url}
            controls
            style={{ width: '100%', maxHeight: '400px', display: 'block' }}
          />
          <IconButton
            onClick={removeVideo}
            sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#FEE2E2' } }}
          >
            <DeleteOutlinedIcon sx={{ color: '#EF4444' }} />
          </IconButton>
          {!video.isExisting && <Box sx={{ position: "absolute", bottom: 12, right: 12, bgcolor: "#10B981", color: "white", fontSize: "0.7rem", fontWeight: 700, px: 1.5, py: 0.5, borderRadius: 1 }}>New</Box>}
        </Box>
      )}
    </Box>
  );
}

// ISOLATED DESCRIPTION EDITOR 
function DescriptionEditor({ initialValue, onSave, onChangeText, error, clearError }) {
  const [content, setContent] = useState(initialValue || "");
  const MAX_CHARS = 1000;

  const [charCount, setCharCount] = useState(() => {
    if (!initialValue) return 0;
    const doc = new DOMParser().parseFromString(initialValue, 'text/html');
    return (doc.body.textContent || "").length;
  });

  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: function (range, context) {
            const currentLength = this.quill.getText().length - 1;
            if (currentLength >= MAX_CHARS) {
              return false;
            }
            return true;
          }
        }
      }
    },
    clipboard: { matchVisual: false }
  }), []);

  useEffect(() => {
    if (!quillRef.current) return;

    const timer = setTimeout(() => {
      if (!quillRef.current || typeof quillRef.current.getEditor !== 'function') return;
      const editor = quillRef.current.getEditor();

      const initialLength = editor.getText().length - 1;
      setCharCount(Math.max(0, initialLength));

      editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        const currentLength = editor.getText().length - 1;

        if (currentLength >= MAX_CHARS) { 
          return new delta.constructor();
        }

        let incomingLength = delta.length();
        if (currentLength + incomingLength > MAX_CHARS) {
          const allowedLength = MAX_CHARS - currentLength;
          return delta.slice(0, allowedLength);
        }

        return delta;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [initialValue]);

  const remainingChars = Math.max(0, MAX_CHARS - charCount);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1 }}>
          Description
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: charCount >= MAX_CHARS ? '#EF4444' : charCount > 800 ? '#F59E0B' : '#6B7280', fontWeight: 600 }}>
            {Math.min(charCount, MAX_CHARS)} / {MAX_CHARS}
          </Typography>
          <Typography variant="caption" sx={{ color: charCount >= MAX_CHARS ? '#EF4444' : '#9CA3AF', fontWeight: 500 }}>
            ({remainingChars} remaining)
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 10, height: 3, mb: 1, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: 10,
          width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%`,
          bgcolor: charCount >= MAX_CHARS ? '#EF4444' : charCount > 800 ? '#F59E0B' : '#5E35B1',
          transition: 'width 0.2s, background-color 0.2s'
        }} />
      </Box>

      <Box sx={{
        bgcolor: 'white', borderRadius: 2, overflow: 'hidden',
        border: error ? '1px solid #EF4444' : '1px solid #E5E7EB',
        '& .ql-toolbar': { border: 'none', borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' },
        '& .ql-container': { border: 'none', fontSize: '16px' },
        '& .ql-editor': { minHeight: '150px', maxHeight: '200px', overflowY: 'auto' }
      }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          defaultValue={initialValue}
          modules={modules}
          onKeyDown={(event) => {
            if (!quillRef.current || typeof quillRef.current.getEditor !== 'function') return;

            const quill = quillRef.current.getEditor();
            const currentLength = quill.getText().length - 1;

            if (currentLength >= MAX_CHARS) {
              if (event.ctrlKey || event.metaKey) return;

              const allowedKeys = [8, 46, 37, 38, 39, 40];
              if (!allowedKeys.includes(event.keyCode)) {
                event.preventDefault();
              }
            }
          }}
          onChange={(val, delta, source, editor) => {
            let currentLength = editor.getText().length - 1;

            if (currentLength > MAX_CHARS) {
              if (quillRef.current && typeof quillRef.current.getEditor === 'function') {
                const quill = quillRef.current.getEditor();
                quill.deleteText(MAX_CHARS, currentLength - MAX_CHARS);
                currentLength = MAX_CHARS;
              }
            }

            setContent(val);
            setCharCount(currentLength);

            const visiblePlainText = editor.getText().trim();

            if (onChangeText) {
              if (visiblePlainText.length === 0) {
                onChangeText("");
              } else {
                onChangeText(val);
              }
            }

            if (error) clearError();
          }}
          onBlur={() => onSave(content)}
          placeholder="Describe the atmosphere, unique features, and the neighborhood..."
        />
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: error ? '#EF4444' : '#6B7280' }}>
        {error}
      </Typography>
    </Box>
  );
}

// MAIN EDIT PROPERTY COMPONENT 
export default function EditProperty() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  // Alert Hook
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();
  const { showError } = useError();
  const { showLoader, hideLoader } = useLoader();

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  // Video States
  const [video, setVideo] = useState(null);
  const [deletedVideo, setDeletedVideo] = useState(false);

  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);

  // CONSTANT FOR MAX IMAGES
  const MAX_IMAGES = 10;

  const [previewImage, setPreviewImage] = useState(null);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [form, setForm] = useState({
    property_name: '', property_type_id: '', description: '',
    country: '', state: '', city: '', address: '', locality: '',
    pincode: '', bedrooms: 1, max_guests: 2, amenity_ids: [],
    latitude: '', longitude: '', status: 2
  });

  const descRef = useRef(form.description);

  // STATE FOR AUTOCOMPLETE 
  const [addressOptions, setAddressOptions] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      try {
        showLoader();
        setLoading(true);
        const [types, locs, amns, res] = await Promise.all([
          fetchPropertyTypes(),
          fetchLocations(),
          fetchAmenities(),
          fetchPropertyById(id)
        ]);

        const p = res.data;
        const loadedTypes = types.data || [];

        setPropertyTypes(loadedTypes);
        setLocations(locs.data || []);
        setAmenities(amns.data || []);

        const matchingType = loadedTypes.find(t => t.name === p.propertyType);
        const matchedTypeId = matchingType ? matchingType.id : '';


        setForm({
          property_name: p.propertyName || '',
          property_type_id: matchedTypeId,
          description: p.description || '',
          country: p.country || '',
          state: p.state || '',
          city: p.city || '',
          locality: p.locality || '',
          address: p.address || '',
          pincode: p.pincode || '',
          bedrooms: p.bedrooms || 1,
          max_guests: p.maxGuests || 2,
          amenity_ids: p.amenities?.map(a => a.id) || [],
          latitude: p.latitude || '',
          longitude: p.longitude || '',
          status: p.status ?? 2
        });

        descRef.current = p.description || '';

        setSearchInputValue(p.address || '');

        if (p.images) {
          setImages(p.images.map(img => ({
            id: img.imageId,
            url: getImageUrl(img.imagePath),
            image_path: img.imagePath,
            is_primary: img.isPrimary,
            isExisting: true,
          })));
        }

        // Load existing video URL if present
        if (p.videoUrl) {
          setVideo({
            url: getImageUrl(p.videoUrl),
            isExisting: true
          });
        }

      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        hideLoader();
        setLoading(false);
      }
    };
    loadAll();
  }, [id]);

  // FETCH SUGGESTIONS FROM GOOGLE AS YOU TYPE 
  useEffect(() => {
    let active = true;

    if (searchInputValue === '') {
      setAddressOptions(form.address ? [{ description: form.address }] : []);
      return undefined;
    }

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    autocompleteService.current.getPlacePredictions(
      { input: searchInputValue },
      (results) => {
        if (active) {
          let newOptions = [];
          if (results) {
            newOptions = [...newOptions, ...results];
          }
          setAddressOptions(newOptions);
        }
      }
    );

    return () => { active = false; };
  }, [searchInputValue, form.address]);


  const uniqueCountries = [...new Set(locations.map(loc => loc.country))].filter(Boolean);
  const uniqueStates = [...new Set(locations.filter(loc => loc.country === form.country).map(loc => loc.state))].filter(Boolean);
  const availableCities = locations.filter(loc => loc.country === form.country && loc.state === form.state);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const setVal = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const mapGoogleAddressToForm = (place) => {
    if (!place || !place.geometry) return;

    const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
    const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

    let gCity = "";
    let gState = "";
    let gCountry = "";
    let gPincode = "";
    let gLocality = "";

    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes("locality") || types.includes("postal_town") || types.includes("sublocality_level_1")) gCity = component.long_name;
        if (types.includes("administrative_area_level_1")) gState = component.long_name;
        if (types.includes("country")) gCountry = component.long_name;
        if (types.includes("postal_code")) gPincode = component.long_name;
        if (types.includes("sublocality") || types.includes("sublocality_level_2") || types.includes("neighborhood")) gLocality = component.long_name;
      });
    }

    setVal("latitude", lat);
    setVal("longitude", lng);
    setVal("address", place.formatted_address || "");
    setVal("country", gCountry);
    setVal("state", gState);
    setVal("city", gCity);
    setVal("locality", gLocality);
    setVal("pincode", gPincode);
  };

  // FETCH FULL DETAILS WHEN A SUGGESTION IS CLICKED 
  const handleAddressSelect = (event, newValue) => {
    setAddressOptions(newValue ? [newValue, ...addressOptions] : addressOptions);

    if (!newValue || !newValue.place_id) {
      if (!newValue) {
        setVal("address", "");
        setVal("latitude", "");
        setVal("longitude", "");
        setVal("country", "");
        setVal("state", "");
        setVal("city", "");
        setVal("pincode", "");
      }
      return;
    }

    const mapElement = document.createElement("div");
    const placesService = new window.google.maps.places.PlacesService(mapElement);

    placesService.getDetails(
      {
        placeId: newValue.place_id,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          mapGoogleAddressToForm(place);
        }
      }
    );
  };

  //  USE MY LOCATION 
  // const handleUseMyLocation = () => {
  //   if (!navigator.geolocation) {
  //     showError("Geolocation is not supported by your browser");
  //     return;
  //   }

  //   showLoader();
  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const { latitude, longitude } = position.coords;
  //       try {
  //         const apiKey = import.meta.env.VITE_API_GOOGLE_KEY;
  //         const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
  //         const data = await response.json();

  //         if (data.results && data.results.length > 0) {
  //           mapGoogleAddressToForm(data.results[0]);
  //           setSearchInputValue(data.results[0].formatted_address);
  //         } else {
  //           setVal("latitude", latitude);
  //           setVal("longitude", longitude);
  //         }
  //       } catch (err) {
  //         console.error("Reverse geocoding failed", err);
  //         showError("Could not translate coordinates to address.");
  //       } finally {
  //         hideLoader();
  //       }
  //     },
  //     (error) => {
  //       hideLoader();
  //       showError("Unable to retrieve your location. Please check your browser permissions.");
  //     }
  //   );
  // };

  // UPDATED ADD FILES LOGIC WITH 10 IMAGE LIMIT
  const addFiles = (files) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You have reached the maximum limit of ${MAX_IMAGES} photos.`);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    let validFiles = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) { alert(`${file.name} is not a valid format. Please use JPG, PNG, or WEBP.`); return; }
      if (file.size > maxSize) { alert(`${file.name} is too large. Maximum size is 10MB.`); return; }
      validFiles.push(file);
    });

    const remainingSpace = MAX_IMAGES - images.length;
    if (validFiles.length > remainingSpace) {
      alert(`You can only add ${remainingSpace} more photo(s). The extra files were ignored.`);
      validFiles = validFiles.slice(0, remainingSpace);
    }

    if (validFiles.length > 0) {
      const newImgs = validFiles.map((file, i) => ({
        id: Date.now() + i, file, url: URL.createObjectURL(file), image_path: file.name, is_primary: images.length === 0 && i === 0, isExisting: false
      }));
      setImages((prev) => [...prev, ...newImgs]);
      if (errors.photos) setErrors(e => ({ ...e, photos: null }));
    }
  };

  const removeImage = (img) => {
    if (img.isExisting) {
      setDeletedImageIds(prev => [...prev, img.id]);
    }
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== img.id);
      if (filtered.length && !filtered.some(i => i.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const setPrimary = (imgId) => setImages((prev) => prev.map(img => ({ ...img, is_primary: img.id === imgId })));

  const validateStep = (step) => {
    setErrors({});
    const formToValidate = { ...form, description: descRef.current };
    const result = validate(formToValidate, propertyListingSchema());

    if (step === 0) {
      const stepErrors = {
        property_name: result.errors.property_name,
        property_type_id: result.errors.property_type_id,
        description: result.errors.description
      };
      const activeErrors = Object.fromEntries(Object.entries(stepErrors).filter(([_, v]) => v));
      setErrors(activeErrors);
      return Object.keys(activeErrors).length === 0;
    }

    if (step === 1) {
      const stepErrors = {
        country: result.errors.country, state: result.errors.state, city: result.errors.city, // 🌟 Changed location_id to city
        address: result.errors.address, pincode: result.errors.pincode, latitude: result.errors.latitude, longitude: result.errors.longitude
      };
      const activeErrors = Object.fromEntries(Object.entries(stepErrors).filter(([_, v]) => v));
      setErrors(activeErrors);
      return Object.keys(activeErrors).length === 0;
    }

    if (step === 2) {
      const stepErrors = { max_guests: result.errors.max_guests, bedrooms: result.errors.bedrooms, amenity_ids: result.errors.amenity_ids };
      const activeErrors = Object.fromEntries(Object.entries(stepErrors).filter(([_, v]) => v));
      setErrors(activeErrors);
      return Object.keys(activeErrors).length === 0;
    }

    if (step === 3) {
      if (images.length === 0) {
        showError("Please upload at least one photo.");
        setErrors(e => ({ ...e, photos: "Please upload at least one photo to continue." }));
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (validateStep(activeStep)) {
      if (activeStep === 0) { setVal("description", descRef.current); }
      setActiveStep((s) => s + 1);
    }
  };

  const back = () => setActiveStep(s => s - 1);

  const handleSubmit = async () => {
    if (images.length === 0) {
      showError("Please upload at least one photo.");
      setErrors(e => ({ ...e, photos: 'Please upload at least one photo to save changes.' }));
      return;
    }

    showLoader();
    setSubmitting(true);

    try {
      const updatePayload = {
        propertyName: form.property_name,
        propertyTypeId: form.property_type_id,
        description: DOMPurify.sanitize(descRef.current),
        country: form.country,
        state: form.state,
        city: form.city,
        locality: form.locality,
        address: form.address,
        pincode: form.pincode,
        bedrooms: form.bedrooms,
        maxGuests: form.max_guests,
        latitude: form.latitude || 0,
        longitude: form.longitude || 0,
        amenityIds: form.amenity_ids
      };
      await updateProperty(id, updatePayload);

      for (const imgId of deletedImageIds) {
        await deletePropertyImage(id, imgId);
      }

      const newImages = images.filter(img => !img.isExisting);
      if (newImages.length > 0) {
        await fetchUploadImages(id, newImages);
      }

      const currentPrimary = images.find(img => img.is_primary);
      const oldPrimary = images.find(img => img.isExisting && img.is_primary);

      if (currentPrimary && currentPrimary.isExisting) {
        await updatePrimaryImage(id, currentPrimary.id);
      }

      // Handle Video Deletion
      if (deletedVideo) {
        await deletePropertyVideo(id);
      }

      // Handle Video Upload
      if (video?.file && !video.isExisting) {
        await fetchUploadVideo(id, video.file);
      }

      showSuccess("Changes Saved Successfully!");
      setTimeout(() => navigate('/owner/properties'), 1500);
    } catch (err) {
      console.error('Failed to update property:', err);
      showError("Failed to save changes.");
    } finally {
      hideLoader();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton width={200} height={32} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  const stepContent = [
    <Box key="basics" sx={{ animation: "fadeIn 0.5s" }}>
      <Box mb={5}>
        <Typography variant="h4" fontWeight={800} color="#111827" mb={1}>Edit property basics</Typography>
        <Typography color="text.secondary" fontSize="1.1rem">Update the type and name of your property.</Typography>
      </Box>
      <Stack spacing={5}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>Property Type</Typography>
          <PillSelector options={propertyTypes} value={form.property_type_id} onChange={(v) => setVal('property_type_id', v)} />
          {errors.property_type_id && <Typography color="error" variant="caption" mt={1} display="block">{errors.property_type_id}</Typography>}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Property Name</Typography>
          <TextField fullWidth value={form.property_name} onChange={set('property_name')} error={!!errors.property_name} helperText={errors.property_name} sx={premiumTextField} />
        </Box>
        <Box>
          <DescriptionEditor
            initialValue={form.description}
            onSave={(val) => setVal("description", val)}
            onChangeText={(val) => { descRef.current = val; }}
            error={errors.description}
            clearError={() => setErrors(prev => ({ ...prev, description: "" }))}
          />
        </Box>
      </Stack>
    </Box>,

    // LOCATION STEP WITH AUTOCOMPLETE 
    <Box key="location" sx={{ animation: "fadeIn 0.5s" }}>
      <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#111827" mb={1}>Where's your place located?</Typography>
        </Box>
        {/* 
        <Button
          variant="outlined"
          startIcon={<LocationIcon />}
          onClick={handleUseMyLocation}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            borderColor: '#E5E7EB', color: '#374151',
            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
          }}
        >
          Use my location
        </Button>
         */}
      </Box>

      <Grid container spacing={4}>

        {/* NATIVE MUI AUTOCOMPLETE  */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Search Address</Typography>
          <Autocomplete
            id="google-map-autocomplete"
            getOptionLabel={(option) => typeof option === 'string' ? option : option.description}
            filterOptions={(x) => x}
            options={addressOptions}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={form.address}
            noOptionsText={searchInputValue === '' ? "Start typing..." : "No matching locations found"}
            onChange={handleAddressSelect}
            onInputChange={(event, newInputValue) => {
              setSearchInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                placeholder="Start typing your property address..."
                sx={premiumTextField}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <Box key={key} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...optionProps}>
                  <LocationIcon sx={{ color: 'text.secondary', mr: 2, width: 20 }} />
                  <Typography variant="body2" color="text.primary">
                    {option.structured_formatting?.main_text || option.description}
                    <Typography component="span" variant="caption" color="text.secondary" display="block">
                      {option.structured_formatting?.secondary_text}
                    </Typography>
                  </Typography>
                </Box>
              );
            }}
          />
        </Grid>


        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Country</Typography>
          <TextField fullWidth value={form.country} slotProps={{ readOnly: true }} sx={readOnlyTextField} error={!!errors.country} helperText={errors.country} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>State</Typography>
          <TextField fullWidth value={form.state} slotProps={{ readOnly: true }} sx={readOnlyTextField} error={!!errors.state} helperText={errors.state} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>City</Typography>
          <TextField fullWidth value={form.city} slotProps={{ readOnly: true }} sx={readOnlyTextField} error={!!errors.city} helperText={errors.city} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Locality</Typography>
            <TextField fullWidth value={form.locality} slotProps={{ readOnly: true }} sx={readOnlyTextField} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Full Street Address *</Typography>
          <TextField fullWidth multiline rows={2} value={form.address} onChange={set('address')} error={!!errors.address} helperText={errors.address} sx={editableWhiteField} />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Pincode *</Typography>
          <TextField fullWidth value={form.pincode} onChange={set('pincode')} error={!!errors.pincode} helperText={errors.pincode} sx={editableWhiteField} />
        </Grid>



        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon fontSize="small" color="primary" /> Latitude
          </Typography>
          <TextField
            fullWidth value={form.latitude}
            slotProps={{ readOnly: true }}
            sx={readOnlyTextField}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon fontSize="small" color="primary" /> Longitude
          </Typography>
          <TextField
            fullWidth value={form.longitude}
            slotProps={{ readOnly: true }}
            sx={readOnlyTextField}
          />
        </Grid>
      </Grid>
    </Box>,

    <Box key="amenities" sx={{ animation: "fadeIn 0.5s" }}>
      <Box mb={5}>
        <Typography variant="h4" fontWeight={800} color="#111827" mb={1}>Update spaces & amenities</Typography>
        <Typography color="text.secondary" fontSize="1.1rem">Adjust guest capacity and available amenities.</Typography>
      </Box>

      <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 4, p: 3, mb: 5, bgcolor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <CounterField label="Guests" icon={<PeopleIcon />} value={form.max_guests} onChange={(v) => { setVal('max_guests', v); setErrors(e => ({ ...e, max_guests: '' })); }} />
        {errors.max_guests && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
            {errors.max_guests}
          </Typography>
        )}

        <CounterField label="Bedrooms" icon={<BedIcon />} value={form.bedrooms} onChange={(v) => { setVal('bedrooms', v); setErrors(e => ({ ...e, bedrooms: '' })); }} />
        {errors.bedrooms && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
            {errors.bedrooms}
          </Typography>
        )}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>
        Amenities
      </Typography>
      <PillSelector
        options={amenities}
        value={form.amenity_ids}
        onChange={(val) => { setVal('amenity_ids', val); setErrors(e => ({ ...e, amenity_ids: '' })); }}
        multi
      />
      {errors.amenity_ids && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
          {errors.amenity_ids}
        </Typography>
      )}
    </Box>,

    // key to "media", updated Titles, and added VideoUploader 
    <Box key="media" sx={{ animation: "fadeIn 0.5s" }}>
      <Box mb={5}>
        <Typography variant="h4" fontWeight={800} color="#111827" mb={1}>Manage property media</Typography>
        <Typography color="text.secondary" fontSize="1.1rem">Add new photos, remove existing ones, or update your video walkthrough.</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>Photos *</Typography>

        {images.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {images.map((img) => (
              <Grid size={{ xs: 4, sm: 3, md: 2.4, lg: 2 }} key={img.id}>
                <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", aspectRatio: "4/3", minHeight: 80, bgcolor: "#F3F4F6", border: img.is_primary ? `3px solid ${theme.palette.primary.main}` : "1px solid #E5E7EB", "&:hover .overlay": { opacity: 1 }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <img
                    src={img.url}
                    alt="Property"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/E5E7EB/9CA3AF?text=Image+Not+Found';
                    }}
                  />

                  <Box className="overlay" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)", opacity: 0, transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="View Photo">
                      <IconButton size="small" onClick={() => setPreviewImage(img.url)} sx={{ bgcolor: "white", padding: 0.5, "&:hover": { bgcolor: "#E0F2FE", transform: "scale(1.1)" } }}>
                        <VisibilityOutlinedIcon sx={{ color: "#0284C7", fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={img.is_primary ? 'Cover Photo' : 'Set as Cover'}>
                      <IconButton size="small" onClick={() => setPrimary(img.id)} sx={{ bgcolor: "white", padding: 0.5, "&:hover": { bgcolor: "white", transform: "scale(1.1)" } }}>
                        {img.is_primary ? <StarIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} /> : <StarBorderIcon sx={{ color: "#4B5563", fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Photo">
                      <IconButton size="small" onClick={() => removeImage(img)} sx={{ bgcolor: "white", padding: 0.5, "&:hover": { bgcolor: "#FEE2E2", transform: "scale(1.1)" } }}>
                        <DeleteOutlinedIcon sx={{ color: "#EF4444", fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {img.is_primary && <Box sx={{ position: "absolute", top: 8, left: 8, bgcolor: theme.palette.primary.main, color: "white", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", px: 1, py: 0.3, borderRadius: 1, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>Cover</Box>}
                  {!img.isExisting && <Box sx={{ position: "absolute", bottom: 4, right: 4, bgcolor: "#10B981", color: "white", fontSize: "0.6rem", fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 1 }}>New</Box>}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* SHOW UPLOADER IF < 10 IMAGES */}
        {images.length < MAX_IMAGES ? (
          <Box onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            sx={{ border: "2px dashed", borderColor: dragging ? theme.palette.primary.main : "#E5E7EB", borderRadius: 4, py: 5, px: 3, textAlign: "center", bgcolor: dragging ? theme.palette.primary.light + "20" : "#F9FAFB", cursor: "pointer", transition: "all 0.2s", position: "relative", "&:hover": { borderColor: theme.palette.primary.main, bgcolor: theme.palette.primary.light + "10" } }}>
            <input type="file" multiple accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} onChange={(e) => { addFiles(e.target.files); e.target.value = null; }} />
            <CloudUploadIcon sx={{ fontSize: 36, color: theme.palette.primary.main, mb: 1, opacity: 0.8 }} />
            <Typography variant="h6" sx={{ color: "#111827", mb: 0.5, fontWeight: 700, fontSize: "1rem" }}>Click or drag photos here</Typography>
            <Typography variant="body2" color="text.secondary">JPG, PNG, WEBP up to 10MB (Max {MAX_IMAGES} photos)</Typography>
          </Box>
        ) : (
          /* SHOW LIMIT REACHED MESSAGE IF 10 IMAGES */
          <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: 3, border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
              Maximum limit of {MAX_IMAGES} photos reached. Remove a photo to add more.
            </Typography>
          </Box>
        )}

        {errors.photos && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            {errors.photos}
          </Typography>
        )}
      </Box>

      {/* ADDED VIDEO UPLOADER COMPONENT HERE  */}
      <Box sx={{ mt: 6, pt: 4, borderTop: "2px solid #F3F4F6" }}>
        <VideoUploader
          video={video}
          setVideo={setVideo}
          onRemoveExisting={() => setDeletedVideo(true)}
        />
      </Box>
    </Box>
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>

      <SuccessAlert open={open} message={message} onClose={closeSuccess} />

      <Box sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10 }}>
        <IconButton onClick={() => navigate('/owner/properties')} sx={{ border: "1px solid #E5E7EB" }}><ArrowBackIcon fontSize="small" /></IconButton>
        <Button variant="text" onClick={() => navigate('/owner/properties')} sx={{ fontWeight: 600, color: '#4B5563', textTransform: 'none' }}>
          Cancel
        </Button>
      </Box>

      <LinearProgress variant="determinate" value={(activeStep / STEPS.length) * 100} sx={{ height: 4, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: theme.palette.primary.main } }} />

      <Grid container sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{
          display: { xs: "none", md: "block" },
          borderRight: "1px solid #F3F4F6",
          bgcolor: "#FAFAFA",
          p: 6, position: "sticky", top: 65, height: "calc(100vh - 65px)", overflowY: "auto"
        }}>
          <Typography variant="h5" fontWeight={800} mb={6} color="#111827">Edit listing</Typography>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ "& .MuiStepConnector-line": { minHeight: 30 } }}>
            {STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel sx={{ py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={index === activeStep ? 800 : 500} color={index === activeStep ? "primary.main" : "text.secondary"}>{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: index === activeStep ? 'block' : 'none', mt: 0.5 }}>{step.description}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ p: { xs: 3, md: 8 }, pb: { xs: 15, md: 15 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 650, flexGrow: 1 }}>
            {stepContent[activeStep]}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{
        position: "fixed", bottom: 0, left: 0, right: 0, bgcolor: "white", borderTop: "1px solid #F3F4F6",
        p: 3, px: { xs: 3, md: 8 },
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        zIndex: 20
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={back}
          disabled={activeStep === 0}
          sx={{
            bgcolor: "#111827",
            color: "white",
            px: 6,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            display: activeStep === 0 ? "none" : "block", // Uses display:none instead of visibility to prevent layout gaps
            "&:hover": { bgcolor: "black", transform: "scale(1.02)" },
            transition: "all 0.2s"
          }}
        >
          Back
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            size="large"
            onClick={next}
            sx={{
              bgcolor: "#111827",
              color: "white",
              px: 6,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              "&:hover": { bgcolor: "black", transform: "scale(1.02)" },
              transition: "all 0.2s"
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              px: 6,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(94, 53, 177, 0.3)"
            }}
          >
            {submitting ? "Publishing..." : "Submit Listing"}
          </Button>
        )}
      </Box>

      {/* Full Screen Image Preview Modal */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth>
        <Box sx={{ position: 'relative', bgcolor: '#111827', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }, zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/E5E7EB/9CA3AF?text=Image+Not+Found';
            }}
          />
        </Box>
      </Dialog>

    </Box>
  );
}